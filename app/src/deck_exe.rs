#![windows_subsystem = "windows"]

use reqwest::blocking::Client;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::fs;
use std::io::{BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::{Duration, Instant};

const INDEX_HTML: &str = include_str!("../../web/index.html");
const STYLE_CSS: &str = include_str!("../../web/style.css");
const APP_JS: &str = include_str!("../../web/app.js");

static ACTIVE_CLIENTS: AtomicUsize = AtomicUsize::new(0);
static EVER_CONNECTED: AtomicBool = AtomicBool::new(false);

fn data_dir() -> PathBuf {
    let base = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."));
    let dir = base.join("user_data");
    let _ = fs::create_dir_all(&dir);
    dir
}

fn read_json_file(dir: &Path, name: &str, fallback: Value) -> Value {
    fs::read_to_string(dir.join(name))
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or(fallback)
}

fn write_json_file(dir: &Path, name: &str, val: &Value) {
    if let Ok(pretty) = serde_json::to_string_pretty(val) {
        let _ = fs::write(dir.join(name), pretty);
    }
}

fn send_resp(stream: &mut TcpStream, status: &str, content_type: &str, body: &[u8]) {
    let header = format!(
        "HTTP/1.1 {status}\r\nContent-Type: {content_type}\r\nContent-Length: {}\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n",
        body.len()
    );
    let _ = stream.write_all(header.as_bytes());
    let _ = stream.write_all(body);
    let _ = stream.flush();
}

fn handle_proxy(client: &Client, kind: &str, rest: &str, headers: &HashMap<String, String>) -> (String, String, Vec<u8>) {
    let (base, mut url_rest) = match kind {
        "cg" => ("https://api.coingecko.com/api", rest.to_owned()),
        "yf" => ("https://query1.finance.yahoo.com", rest.to_owned()),
        "cmc" => ("https://pro-api.coinmarketcap.com", rest.to_owned()),
        "av" => ("https://www.alphavantage.co", rest.to_owned()),
        "fh" => ("https://finnhub.io/api/v1", rest.to_owned()),
        _ => return ("404 Not Found".into(), "application/json".into(), b"{\"error\":\"unknown\"}".to_vec()),
    };

    let mut req = client.get(format!("{base}{url_rest}"));
    if kind == "cmc" {
        let Some(key) = headers.get("x-cmc-key") else {
            return ("401 Unauthorized".into(), "application/json".into(), b"{\"error\":\"missing CoinMarketCap key\"}".to_vec());
        };
        req = req.header("X-CMC_PRO_API_KEY", key);
    } else if kind == "fh" {
        if let Some(key) = headers.get("x-api-key") {
            req = req.header("X-Finnhub-Token", key);
        }
    } else if kind == "av" {
        if let Some(key) = headers.get("x-api-key") {
            let sep = if url_rest.contains('?') { '&' } else { '?' };
            url_rest.push(sep);
            url_rest.push_str("apikey=");
            url_rest.push_str(key);
            req = client.get(format!("{base}{url_rest}"));
        }
    }

    match req.header("Accept", "application/json").send() {
        Ok(resp) => {
            let code = resp.status().as_u16();
            let reason = resp.status().canonical_reason().unwrap_or("OK");
            let ct = resp
                .headers()
                .get("content-type")
                .and_then(|v| v.to_str().ok())
                .unwrap_or("application/json")
                .to_owned();
            let bytes = resp.bytes().map(|b| b.to_vec()).unwrap_or_default();
            (format!("{code} {reason}"), ct, bytes)
        }
        Err(e) => (
            "502 Bad Gateway".into(),
            "application/json".into(),
            serde_json::to_vec(&json!({ "error": e.to_string() })).unwrap_or_default(),
        ),
    }
}

fn handle_events(stream: &mut TcpStream) {
    struct ClientGuard;
    impl Drop for ClientGuard {
        fn drop(&mut self) {
            ACTIVE_CLIENTS.fetch_sub(1, Ordering::SeqCst);
        }
    }
    ACTIVE_CLIENTS.fetch_add(1, Ordering::SeqCst);
    EVER_CONNECTED.store(true, Ordering::SeqCst);
    let _guard = ClientGuard;

    let head = "HTTP/1.1 200 OK\r\nContent-Type: text/event-stream\r\nCache-Control: no-cache\r\nConnection: keep-alive\r\n\r\n:ok\n\n";
    if stream.write_all(head.as_bytes()).is_err() || stream.flush().is_err() {
        return;
    }
    loop {
        thread::sleep(Duration::from_secs(2));
        if stream.write_all(b":hb\n\n").is_err() || stream.flush().is_err() {
            break;
        }
    }
}

fn handle_conn(mut stream: TcpStream, client: Arc<Client>, dir: Arc<PathBuf>) {
    let mut reader = BufReader::new(&mut stream);
    let mut req_line = String::new();
    if reader.read_line(&mut req_line).unwrap_or(0) == 0 {
        return;
    }
    let mut parts = req_line.split_whitespace();
    let method = parts.next().unwrap_or("GET").to_owned();
    let raw_url = parts.next().unwrap_or("/").to_owned();

    let mut headers = HashMap::new();
    let mut content_len: usize = 0;
    loop {
        let mut line = String::new();
        if reader.read_line(&mut line).unwrap_or(0) == 0 {
            break;
        }
        let trimmed = line.trim_end_matches(['\r', '\n']);
        if trimmed.is_empty() {
            break;
        }
        if let Some((k, v)) = trimmed.split_once(':') {
            let kl = k.trim().to_ascii_lowercase();
            let vv = v.trim().to_owned();
            if kl == "content-length" {
                content_len = vv.parse().unwrap_or(0);
            }
            headers.insert(kl, vv);
        }
    }

    let mut body = vec![0u8; content_len.min(5_000_000)];
    if !body.is_empty() {
        let _ = reader.read_exact(&mut body);
    }
    let stream = reader.into_inner();

    let path_only = raw_url.split('?').next().unwrap_or(&raw_url);
    match (method.as_str(), path_only) {
        ("GET", "/") | ("GET", "/index.html") => send_resp(stream, "200 OK", "text/html; charset=utf-8", INDEX_HTML.as_bytes()),
        ("GET", "/style.css") => send_resp(stream, "200 OK", "text/css; charset=utf-8", STYLE_CSS.as_bytes()),
        ("GET", "/app.js") => send_resp(stream, "200 OK", "text/javascript; charset=utf-8", APP_JS.as_bytes()),
        ("GET", "/api/ping") => send_resp(stream, "200 OK", "application/json", br#"{"ok":true}"#),
        ("GET", "/api/events") => handle_events(stream),
        ("GET", "/api/data") => {
            let payload = json!({
                "assets": read_json_file(&dir, "portfolio.json", json!([])),
                "watch": read_json_file(&dir, "watchlist.json", json!([])),
                "cfg": read_json_file(&dir, "settings.json", json!({ "cmcKey": "", "apis": [], "theme": "dark", "cur": "USD" })),
            });
            let bytes = serde_json::to_vec(&payload).unwrap_or_else(|_| b"{}".to_vec());
            send_resp(stream, "200 OK", "application/json", &bytes);
        }
        ("POST", "/api/data") => {
            if let Ok(v) = serde_json::from_slice::<Value>(&body) {
                if let Some(a) = v.get("assets").filter(|x| x.is_array()) {
                    write_json_file(&dir, "portfolio.json", a);
                }
                if let Some(w) = v.get("watch").filter(|x| x.is_array()) {
                    write_json_file(&dir, "watchlist.json", w);
                }
                if let Some(c) = v.get("cfg").filter(|x| x.is_object()) {
                    write_json_file(&dir, "settings.json", c);
                }
                send_resp(stream, "200 OK", "application/json", br#"{"ok":true}"#);
            } else {
                send_resp(stream, "400 Bad Request", "application/json", br#"{"error":"invalid json"}"#);
            }
        }
        _ if raw_url.starts_with("/api/") => {
            let rest_all = &raw_url[5..];
            if let Some((kind, rest)) = rest_all.split_once('/') {
                let with_slash = format!("/{rest}");
                let (status, ct, out) = handle_proxy(&client, kind, &with_slash, &headers);
                send_resp(stream, &status, &ct, &out);
            } else {
                send_resp(stream, "404 Not Found", "text/plain", b"Not found");
            }
        }
        _ => send_resp(stream, "404 Not Found", "text/plain", b"Not found"),
    }
}

fn find_browser() -> Option<PathBuf> {
    let candidates = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ];
    candidates.iter().map(PathBuf::from).find(|p| p.exists())
}

fn main() {
    let dir = Arc::new(data_dir());
    let listener = TcpListener::bind("127.0.0.1:4173")
        .or_else(|_| TcpListener::bind("127.0.0.1:0"))
        .expect("bind localhost");
    let port = listener.local_addr().expect("local addr").port();

    let client = Arc::new(
        Client::builder()
            .timeout(Duration::from_secs(20))
            .user_agent("Mozilla/5.0 PortfolioDeck/1.0")
            .build()
            .expect("http client"),
    );

    let srv_dir = Arc::clone(&dir);
    thread::spawn(move || {
        for stream in listener.incoming().flatten() {
            let c = Arc::clone(&client);
            let d = Arc::clone(&srv_dir);
            thread::spawn(move || handle_conn(stream, c, d));
        }
    });

    let url = format!("http://127.0.0.1:{port}/index.html");
    let mut launched = false;
    if let Some(browser) = find_browser() {
        let profile = dir.join(".app_profile");
        if Command::new(browser)
            .arg(format!("--app={url}"))
            .arg(format!("--user-data-dir={}", profile.display()))
            .arg("--window-size=1440,900")
            .spawn()
            .is_ok()
        {
            launched = true;
        }
    }
    if !launched {
        let _ = Command::new("cmd").args(["/C", "start", "", &url]).spawn();
    }

    let start = Instant::now();
    let mut last_active = Instant::now();
    loop {
        thread::sleep(Duration::from_millis(500));
        if ACTIVE_CLIENTS.load(Ordering::SeqCst) > 0 {
            last_active = Instant::now();
            continue;
        }
        if EVER_CONNECTED.load(Ordering::SeqCst) {
            if last_active.elapsed() >= Duration::from_secs(4) {
                break;
            }
        } else if start.elapsed() >= Duration::from_secs(30) {
            break;
        }
    }
}
