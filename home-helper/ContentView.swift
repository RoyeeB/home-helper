import SwiftUI

struct ContentView: View {
    @StateObject var authVM = AuthViewModel()
    @AppStorage("isHebrew") private var isHebrew = true

    var body: some View {
        ZStack {
            if authVM.isLoading {
                ZStack {
                    Color.appBg.ignoresSafeArea()
                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(Color.appPrimary)
                        .scaleEffect(1.5)
                }
                .transition(.opacity)
            } else if authVM.user == nil {
                LoginView()
                    .environmentObject(authVM)
                    .transition(.asymmetric(insertion: .move(edge: .bottom).combined(with: .opacity),
                                            removal: .opacity))
            } else if authVM.profile?.houseId == nil && authVM.profile?.pendingHouseId != nil {
                WaitingApprovalView()
                    .environmentObject(authVM)
                    .transition(.opacity.combined(with: .scale(scale: 0.97)))
            } else if authVM.profile?.houseId == nil {
                HouseSetupView()
                    .environmentObject(authVM)
                    .transition(.opacity.combined(with: .scale(scale: 0.97)))
            } else {
                MainTabView()
                    .environmentObject(authVM)
                    .transition(.asymmetric(insertion: .opacity.combined(with: .scale(scale: 0.97)),
                                            removal: .opacity))
            }
        }
        .animation(.spring(response: 0.45, dampingFraction: 0.85), value: authVM.user?.uid)
        .animation(.spring(response: 0.45, dampingFraction: 0.85), value: authVM.profile?.houseId)
        .animation(.spring(response: 0.45, dampingFraction: 0.85), value: authVM.isLoading)
        .preferredColorScheme(.dark)
        .environment(\.layoutDirection, isHebrew ? .rightToLeft : .leftToRight)
        .animation(.easeInOut(duration: 0.3), value: isHebrew)
    }
}
