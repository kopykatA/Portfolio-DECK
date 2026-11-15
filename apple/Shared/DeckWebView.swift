import SwiftUI
import WebKit
#if canImport(UniformTypeIdentifiers)
import UniformTypeIdentifiers
#endif

#if os(macOS)
struct DeckWebView: NSViewRepresentable {
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(context.coordinator.schemeHandler, forURLScheme: "deck")
        config.userContentController.add(context.coordinator, name: "exportCsv")
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.setValue(false, forKey: "drawsBackground")
        webView.load(URLRequest(url: URL(string: "deck://localhost/index.html")!))
        return webView
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKDownloadDelegate, WKScriptMessageHandler {
        let schemeHandler = DeckSchemeHandler()

        func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
            let panel = NSOpenPanel()
            panel.canChooseFiles = true
            panel.canChooseDirectories = false
            panel.allowsMultipleSelection = parameters.allowsMultipleSelection
            panel.begin { response in
                completionHandler(response == .OK ? panel.urls : nil)
            }
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "exportCsv",
                  let dict = message.body as? [String: Any],
                  let filename = dict["filename"] as? String,
                  let content = dict["content"] as? String else { return }
            let panel = NSSavePanel()
            panel.nameFieldStringValue = filename
            panel.allowedContentTypes = [.commaSeparatedText]
            if panel.runModal() == .OK, let url = panel.url {
                try? content.write(to: url, atomically: true, encoding: .utf8)
            }
        }

        func webView(_ webView: WKWebView, navigationAction: WKNavigationAction, didBecome download: WKDownload) {
            download.delegate = self
        }

        func download(_ download: WKDownload, decideDestinationUsing response: URLResponse, suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
            let downloads = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask).first
                ?? FileManager.default.temporaryDirectory
            completionHandler(downloads.appendingPathComponent(suggestedFilename))
        }
    }
}
#else
struct DeckWebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(context.coordinator.schemeHandler, forURLScheme: "deck")
        config.userContentController.add(context.coordinator, name: "exportCsv")
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.minimumZoomScale = 1.0
        webView.scrollView.maximumZoomScale = 1.0
        webView.scrollView.bouncesZoom = false
        webView.load(URLRequest(url: URL(string: "deck://localhost/index.html")!))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKDownloadDelegate, WKScriptMessageHandler {
        let schemeHandler = DeckSchemeHandler()

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "exportCsv",
                  let dict = message.body as? [String: Any],
                  let filename = dict["filename"] as? String,
                  let content = dict["content"] as? String else { return }
            let tmpURL = FileManager.default.temporaryDirectory.appendingPathComponent(filename)
            try? content.write(to: tmpURL, atomically: true, encoding: .utf8)
            DispatchQueue.main.async {
                guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                      let root = scene.windows.first(where: { $0.isKeyWindow })?.rootViewController else { return }
                let vc = UIActivityViewController(activityItems: [tmpURL], applicationActivities: nil)
                vc.popoverPresentationController?.sourceView = root.view
                root.present(vc, animated: true)
            }
        }

        func webView(_ webView: WKWebView, navigationAction: WKNavigationAction, didBecome download: WKDownload) {
            download.delegate = self
        }

        func download(_ download: WKDownload, decideDestinationUsing response: URLResponse, suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
            let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
                ?? FileManager.default.temporaryDirectory
            completionHandler(docs.appendingPathComponent(suggestedFilename))
        }
    }
}
#endif
