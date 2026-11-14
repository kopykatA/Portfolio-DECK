import Foundation
import WebKit

final class DeckSchemeHandler: NSObject, WKURLSchemeHandler {
    private let lock = NSLock()
    private var activeTasks: [ObjectIdentifier: URLSessionDataTask] = [:]

    private let session: URLSession = {
        let cfg = URLSessionConfiguration.default
        cfg.timeoutIntervalForRequest = 20
        cfg.httpAdditionalHeaders = [
            "User-Agent": "Mozilla/5.0 PortfolioDeck/1.0"
        ]
        return URLSession(configuration: cfg)
    }()

    private lazy var dataDir: URL = {
        let fm = FileManager.default
        let base = fm.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? fm.temporaryDirectory
        let dir = base.appendingPathComponent("PortfolioDECK", isDirectory: true)
            .appendingPathComponent("user_data", isDirectory: true)
        try? fm.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }()

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        let req = urlSchemeTask.request
        guard let url = req.url else {
            finish(urlSchemeTask, status: 400, contentType: "text/plain", data: Data("Bad URL".utf8))
            return
        }

        let method = (req.httpMethod ?? "GET").uppercased()
        let path = url.path.isEmpty ? "/" : url.path

        if method == "GET", path == "/" || path == "/index.html" {
            serveBundleFile("index", ext: "html", contentType: "text/html; charset=utf-8", task: urlSchemeTask)
            return
        }
        if method == "GET", path == "/style.css" {
            serveBundleFile("style", ext: "css", contentType: "text/css; charset=utf-8", task: urlSchemeTask)
            return
        }
        if method == "GET", path == "/app.js" {
            serveBundleFile("app", ext: "js", contentType: "text/javascript; charset=utf-8", task: urlSchemeTask)
            return
        }

        if method == "GET", path == "/api/ping" {
            finish(urlSchemeTask, status: 200, contentType: "application/json", data: Data(#"{"ok":true}"#.utf8))
            return
        }

        if method == "GET", path == "/api/events" {
            finish(urlSchemeTask, status: 200, contentType: "text/event-stream", data: Data(":ok\n\n".utf8))
            return
        }

        if path == "/api/data" {
            if method == "GET" {
                let payload: [String: Any] = [
                    "assets": readJSON("portfolio.json", fallback: []),
                    "watch": readJSON("watchlist.json", fallback: []),
                    "cfg": readJSON("settings.json", fallback: [
                        "cmcKey": "",
                        "apis": [],
                        "theme": "dark",
                        "cur": "USD"
                    ])
                ]
                let data = (try? JSONSerialization.data(withJSONObject: payload)) ?? Data("{}".utf8)
                finish(urlSchemeTask, status: 200, contentType: "application/json", data: data)
                return
            }
            if method == "POST" {
                let body = req.httpBody ?? Data()
                if let obj = (try? JSONSerialization.jsonObject(with: body)) as? [String: Any] {
                    if let assets = obj["assets"] as? [Any] {
                        writeJSON("portfolio.json", value: assets)
                    }
                    if let watch = obj["watch"] as? [Any] {
                        writeJSON("watchlist.json", value: watch)
                    }
                    if let cfg = obj["cfg"] as? [String: Any] {
                        writeJSON("settings.json", value: cfg)
                    }
                    finish(urlSchemeTask, status: 200, contentType: "application/json", data: Data(#"{"ok":true}"#.utf8))
                } else {
                    finish(urlSchemeTask, status: 400, contentType: "application/json", data: Data(#"{"error":"invalid json"}"#.utf8))
                }
                return
            }
        }

        if path.hasPrefix("/api/") {
            let remainder = String(path.dropFirst(5))
            if let slashIdx = remainder.firstIndex(of: "/") {
                let kind = String(remainder[..<slashIdx])
                var rest = String(remainder[slashIdx...])
                if let query = url.query, !query.isEmpty {
                    rest += "?\(query)"
                }
                proxyRequest(kind: kind, rest: rest, originalRequest: req, schemeTask: urlSchemeTask)
                return
            }
        }

        finish(urlSchemeTask, status: 404, contentType: "text/plain", data: Data("Not found".utf8))
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        let key = ObjectIdentifier(urlSchemeTask as AnyObject)
        lock.lock()
        let task = activeTasks.removeValue(forKey: key)
        lock.unlock()
        task?.cancel()
    }

    // MARK: - Bundle Resources

    private func serveBundleFile(_ name: String, ext: String, contentType: String, task: WKURLSchemeTask) {
        let url = Bundle.main.url(forResource: name, withExtension: ext, subdirectory: "web")
            ?? Bundle.main.url(forResource: name, withExtension: ext)
        guard let fileURL = url, let data = try? Data(contentsOf: fileURL) else {
            finish(task, status: 404, contentType: "text/plain", data: Data("Missing resource \(name).\(ext)".utf8))
            return
        }
        finish(task, status: 200, contentType: contentType, data: data)
    }

    // MARK: - Persistence

    private func readJSON(_ filename: String, fallback: Any) -> Any {
        let fileURL = dataDir.appendingPathComponent(filename)
        guard let data = try? Data(contentsOf: fileURL),
              let obj = try? JSONSerialization.jsonObject(with: data) else {
            return fallback
        }
        return obj
    }

    private func writeJSON(_ filename: String, value: Any) {
        let fileURL = dataDir.appendingPathComponent(filename)
        guard let data = try? JSONSerialization.data(withJSONObject: value, options: [.prettyPrinted]) else {
            return
        }
        try? data.write(to: fileURL, options: .atomic)
    }

    // MARK: - Upstream Proxy

    private func proxyRequest(kind: String, rest: String, originalRequest: URLRequest, schemeTask: WKURLSchemeTask) {
        let bases: [String: String] = [
            "cg": "https://api.coingecko.com/api",
            "yf": "https://query1.finance.yahoo.com",
            "cmc": "https://pro-api.coinmarketcap.com",
            "av": "https://www.alphavantage.co",
            "fh": "https://finnhub.io/api/v1"
        ]
        guard let base = bases[kind] else {
            finish(schemeTask, status: 404, contentType: "application/json", data: Data(#"{"error":"unknown"}"#.utf8))
            return
        }

        let headers = originalRequest.allHTTPHeaderFields ?? [:]
        let lowerHeaders = Dictionary(uniqueKeysWithValues: headers.map { ($0.key.lowercased(), $0.value) })

        var targetString = base + rest
        if kind == "av", let apiKey = lowerHeaders["x-api-key"], !apiKey.isEmpty {
            let sep = targetString.contains("?") ? "&" : "?"
            let encoded = apiKey.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? apiKey
            targetString += "\(sep)apikey=\(encoded)"
        }

        guard let targetURL = URL(string: targetString) else {
            finish(schemeTask, status: 400, contentType: "application/json", data: Data(#"{"error":"bad upstream url"}"#.utf8))
            return
        }

        var upstreamReq = URLRequest(url: targetURL)
        upstreamReq.setValue("application/json", forHTTPHeaderField: "Accept")
        upstreamReq.setValue("Mozilla/5.0 PortfolioDeck/1.0", forHTTPHeaderField: "User-Agent")

        if kind == "cmc" {
            guard let key = lowerHeaders["x-cmc-key"], !key.isEmpty else {
                finish(schemeTask, status: 401, contentType: "application/json", data: Data(#"{"error":"missing CoinMarketCap key"}"#.utf8))
                return
            }
            upstreamReq.setValue(key, forHTTPHeaderField: "X-CMC_PRO_API_KEY")
        } else if kind == "fh", let key = lowerHeaders["x-api-key"], !key.isEmpty {
            upstreamReq.setValue(key, forHTTPHeaderField: "X-Finnhub-Token")
        }

        let taskKey = ObjectIdentifier(schemeTask as AnyObject)
        let dataTask = session.dataTask(with: upstreamReq) { [weak self] data, response, error in
            guard let self else { return }
            self.lock.lock()
            let stillActive = self.activeTasks.removeValue(forKey: taskKey) != nil
            self.lock.unlock()
            guard stillActive else { return }

            if let error {
                let msg = (try? JSONSerialization.data(withJSONObject: ["error": error.localizedDescription]))
                    ?? Data(#"{"error":"upstream failed"}"#.utf8)
                self.finish(schemeTask, status: 502, contentType: "application/json", data: msg)
                return
            }

            let http = response as? HTTPURLResponse
            let status = http?.statusCode ?? 200
            let ct = http?.value(forHTTPHeaderField: "Content-Type") ?? "application/json"
            self.finish(schemeTask, status: status, contentType: ct, data: data ?? Data())
        }

        lock.lock()
        activeTasks[taskKey] = dataTask
        lock.unlock()
        dataTask.resume()
    }

    private func finish(_ task: WKURLSchemeTask, status: Int, contentType: String, data: Data) {
        let url = task.request.url ?? URL(string: "deck://localhost/")!
        let headers = [
            "Content-Type": contentType,
            "Content-Length": "\(data.count)",
            "Cache-Control": "no-store"
        ]
        if let response = HTTPURLResponse(url: url, statusCode: status, httpVersion: "HTTP/1.1", headerFields: headers) {
            task.didReceive(response)
            task.didReceive(data)
            task.didFinish()
        }
    }
}
