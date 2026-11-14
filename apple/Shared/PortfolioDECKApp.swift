import SwiftUI

@main
struct PortfolioDECKApp: App {
    var body: some Scene {
        WindowGroup("Portfolio DECK") {
            DeckWebView()
                .ignoresSafeArea()
                #if os(macOS)
                .frame(minWidth: 960, minHeight: 640)
                #endif
        }
        #if os(macOS)
        .defaultSize(width: 1440, height: 900)
        #endif
    }
}
