import SwiftUI
import FirebaseCore

@main
struct home_helperApp: App {
    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
