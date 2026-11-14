package com.kopykata.portfoliodeck;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private WebView webView;
    private ServerSocket serverSocket;
    private final ExecutorService pool = Executors.newCachedThreadPool();
    private File dataDir;
    private ValueCallback<Uri[]> fileCallback;
    private static final int FILE_REQ_CODE = 1001;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#06080e"));
        getWindow().setNavigationBarColor(Color.parseColor("#06080e"));

        dataDir = new File(getFilesDir(), "user_data");
        if (!dataDir.exists()) dataDir.mkdirs();

        int port = startLocalServer();

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#06080e"));
        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setBuiltInZoomControls(false);
        ws.setDisplayZoomControls(false);
        ws.setSupportZoom(false);
        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                startActivityForResult(Intent.createChooser(intent, "Select CSV"), FILE_REQ_CODE);
                return true;
            }
        });
        setContentView(webView);

        webView.loadUrl("http://127.0.0.1:" + port + "/index.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_REQ_CODE && fileCallback != null) {
            Uri[] res = (resultCode == RESULT_OK && data != null && data.getData() != null)
                ? new Uri[]{data.getData()} : null;
            fileCallback.onReceiveValue(res);
            fileCallback = null;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            if (serverSocket != null) serverSocket.close();
        } catch (IOException ignored) {}
        pool.shutdownNow();
    }

    public class Bridge {
        @JavascriptInterface
        public void exportCsv(String filename, String content) {
            Intent sendIntent = new Intent(Intent.ACTION_SEND);
            sendIntent.setType("text/csv");
            sendIntent.putExtra(Intent.EXTRA_SUBJECT, filename);
            sendIntent.putExtra(Intent.EXTRA_TEXT, content);
            runOnUiThread(() -> startActivity(Intent.createChooser(sendIntent, "Export CSV")));
        }
    }

    private int startLocalServer() {
        try {
            serverSocket = new ServerSocket(0, 50, InetAddress.getByName("127.0.0.1"));
            int port = serverSocket.getLocalPort();
            pool.submit(() -> {
                while (!serverSocket.isClosed()) {
                    try {
                        Socket client = serverSocket.accept();
                        pool.submit(() -> handleClient(client));
                    } catch (IOException ignored) {
                        break;
                    }
                }
            });
            return port;
        } catch (IOException e) {
            return 4173;
        }
    }

    private void handleClient(Socket socket) {
        try (Socket s = socket) {
            InputStream in = new BufferedInputStream(s.getInputStream());
            OutputStream out = new BufferedOutputStream(s.getOutputStream());

            String reqLine = readLine(in);
            if (reqLine == null || reqLine.isEmpty()) return;
            String[] parts = reqLine.split(" ");
            String method = parts.length > 0 ? parts[0] : "GET";
            String rawUrl = parts.length > 1 ? parts[1] : "/";

            Map<String, String> headers = new HashMap<>();
            int contentLen = 0;
            String line;
            while ((line = readLine(in)) != null && !line.isEmpty()) {
                int idx = line.indexOf(':');
                if (idx > 0) {
                    String k = line.substring(0, idx).trim().toLowerCase();
                    String v = line.substring(idx + 1).trim();
                    headers.put(k, v);
                    if ("content-length".equals(k)) {
                        try { contentLen = Integer.parseInt(v); } catch (NumberFormatException ignored) {}
                    }
                }
            }

            byte[] body = new byte[Math.min(contentLen, 5_000_000)];
            int read = 0;
            while (read < body.length) {
                int r = in.read(body, read, body.length - read);
                if (r < 0) break;
                read += r;
            }

            String pathOnly = rawUrl.contains("?") ? rawUrl.substring(0, rawUrl.indexOf('?')) : rawUrl;
            if ("GET".equals(method) && ("/".equals(pathOnly) || "/index.html".equals(pathOnly))) {
                sendResp(out, "200 OK", "text/html; charset=utf-8", readAsset("web/index.html"));
            } else if ("GET".equals(method) && "/style.css".equals(pathOnly)) {
                sendResp(out, "200 OK", "text/css; charset=utf-8", readAsset("web/style.css"));
            } else if ("GET".equals(method) && "/app.js".equals(pathOnly)) {
                sendResp(out, "200 OK", "text/javascript; charset=utf-8", readAsset("web/app.js"));
            } else if ("GET".equals(method) && "/api/ping".equals(pathOnly)) {
                sendResp(out, "200 OK", "application/json", "{\"ok\":true}".getBytes(StandardCharsets.UTF_8));
            } else if ("GET".equals(method) && "/api/events".equals(pathOnly)) {
                sendResp(out, "200 OK", "text/event-stream", ":ok\n\n".getBytes(StandardCharsets.UTF_8));
            } else if ("/api/data".equals(pathOnly)) {
                if ("GET".equals(method)) {
                    JSONObject payload = new JSONObject();
                    payload.put("assets", readJsonArray("portfolio.json"));
                    payload.put("watch", readJsonArray("watchlist.json"));
                    payload.put("cfg", readJsonObject("settings.json"));
                    sendResp(out, "200 OK", "application/json", payload.toString().getBytes(StandardCharsets.UTF_8));
                } else if ("POST".equals(method)) {
                    JSONObject obj = new JSONObject(new String(body, StandardCharsets.UTF_8));
                    if (obj.has("assets") && obj.get("assets") instanceof JSONArray) {
                        writeFile("portfolio.json", obj.getJSONArray("assets").toString(2));
                    }
                    if (obj.has("watch") && obj.get("watch") instanceof JSONArray) {
                        writeFile("watchlist.json", obj.getJSONArray("watch").toString(2));
                    }
                    if (obj.has("cfg") && obj.get("cfg") instanceof JSONObject) {
                        writeFile("settings.json", obj.getJSONObject("cfg").toString(2));
                    }
                    sendResp(out, "200 OK", "application/json", "{\"ok\":true}".getBytes(StandardCharsets.UTF_8));
                }
            } else if (rawUrl.startsWith("/api/")) {
                String restAll = rawUrl.substring(5);
                int slash = restAll.indexOf('/');
                if (slash > 0) {
                    String kind = restAll.substring(0, slash);
                    String rest = restAll.substring(slash);
                    proxy(out, kind, rest, headers);
                } else {
                    sendResp(out, "404 Not Found", "text/plain", "Not found".getBytes(StandardCharsets.UTF_8));
                }
            } else {
                sendResp(out, "404 Not Found", "text/plain", "Not found".getBytes(StandardCharsets.UTF_8));
            }
        } catch (Exception ignored) {}
    }

    private void proxy(OutputStream out, String kind, String rest, Map<String, String> headers) throws IOException {
        String base;
        switch (kind) {
            case "cg": base = "https://api.coingecko.com/api"; break;
            case "yf": base = "https://query1.finance.yahoo.com"; break;
            case "cmc": base = "https://pro-api.coinmarketcap.com"; break;
            case "av": base = "https://www.alphavantage.co"; break;
            case "fh": base = "https://finnhub.io/api/v1"; break;
            default:
                sendResp(out, "404 Not Found", "application/json", "{\"error\":\"unknown\"}".getBytes(StandardCharsets.UTF_8));
                return;
        }
        String target = base + rest;
        if ("av".equals(kind) && headers.containsKey("x-api-key")) {
            String key = URLEncoder.encode(headers.get("x-api-key"), "UTF-8");
            target += (target.contains("?") ? "&" : "?") + "apikey=" + key;
        }
        HttpURLConnection conn = (HttpURLConnection) new URL(target).openConnection();
        conn.setConnectTimeout(15000);
        conn.setReadTimeout(20000);
        conn.setRequestProperty("Accept", "application/json");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0 PortfolioDeck/1.0");
        if ("cmc".equals(kind)) {
            String key = headers.get("x-cmc-key");
            if (key == null || key.isEmpty()) {
                sendResp(out, "401 Unauthorized", "application/json", "{\"error\":\"missing CoinMarketCap key\"}".getBytes(StandardCharsets.UTF_8));
                return;
            }
            conn.setRequestProperty("X-CMC_PRO_API_KEY", key);
        } else if ("fh".equals(kind) && headers.containsKey("x-api-key")) {
            conn.setRequestProperty("X-Finnhub-Token", headers.get("x-api-key"));
        }
        int code = conn.getResponseCode();
        String msg = conn.getResponseMessage() != null ? conn.getResponseMessage() : "OK";
        String ct = conn.getContentType() != null ? conn.getContentType() : "application/json";
        InputStream respIn = code >= 400 ? conn.getErrorStream() : conn.getInputStream();
        byte[] respBytes = respIn != null ? readAll(respIn) : new byte[0];
        sendResp(out, code + " " + msg, ct, respBytes);
    }

    private byte[] readAsset(String path) throws IOException {
        try (InputStream is = getAssets().open(path)) {
            return readAll(is);
        }
    }

    private JSONArray readJsonArray(String name) {
        try {
            return new JSONArray(readFile(name, "[]"));
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    private JSONObject readJsonObject(String name) {
        try {
            return new JSONObject(readFile(name, "{\"cmcKey\":\"\",\"apis\":[],\"theme\":\"dark\",\"cur\":\"USD\"}"));
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    private String readFile(String name, String fallback) {
        File f = new File(dataDir, name);
        if (!f.exists()) return fallback;
        try (FileInputStream fis = new FileInputStream(f)) {
            return new String(readAll(fis), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return fallback;
        }
    }

    private void writeFile(String name, String content) {
        File f = new File(dataDir, name);
        try (FileOutputStream fos = new FileOutputStream(f)) {
            fos.write(content.getBytes(StandardCharsets.UTF_8));
        } catch (IOException ignored) {}
    }

    private static byte[] readAll(InputStream is) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = is.read(buf)) >= 0) bos.write(buf, 0, n);
        return bos.toByteArray();
    }

    private static String readLine(InputStream in) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        int b;
        while ((b = in.read()) != -1) {
            if (b == '\n') break;
            if (b != '\r') bos.write(b);
        }
        if (b == -1 && bos.size() == 0) return null;
        return bos.toString("UTF-8");
    }

    private static void sendResp(OutputStream out, String status, String ct, byte[] body) throws IOException {
        String hdr = "HTTP/1.1 " + status + "\r\nContent-Type: " + ct + "\r\nContent-Length: " + body.length + "\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n";
        out.write(hdr.getBytes(StandardCharsets.UTF_8));
        out.write(body);
        out.flush();
    }
}
