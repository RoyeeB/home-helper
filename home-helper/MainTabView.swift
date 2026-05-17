import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @StateObject var houseVM = HouseViewModel()
    @AppStorage("isHebrew") private var isHebrew = true
    @State private var selectedTab = 0
    @State private var prevTab = 0

    private func label(_ i: Int) -> String {
        switch i {
        case 0: return isHebrew ? "בית"     : "Home"
        case 1: return isHebrew ? "הוצאות"  : "Expenses"
        case 2: return isHebrew ? "קבועות"  : "Fixed"
        case 3: return isHebrew ? "קניות"   : "Shopping"
        case 4: return isHebrew ? "גרפים"   : "Charts"
        default: return ""
        }
    }

    private let icons = [
        ("house","house.fill"),("creditcard","creditcard.fill"),
        ("repeat.circle","repeat.circle.fill"),("cart","cart.fill"),
        ("chart.bar","chart.bar.fill")
    ]

    private func badge(_ i: Int) -> Int {
        i == 0 ? houseVM.joinRequests.count :
        i == 3 ? houseVM.shoppingItems.filter { !$0.checked }.count : 0
    }

    private var tabTransition: AnyTransition {
        let fwd = selectedTab > prevTab
        return .asymmetric(
            insertion: .move(edge: fwd ? .trailing : .leading).combined(with: .opacity),
            removal:   .move(edge: fwd ? .leading  : .trailing).combined(with: .opacity)
        )
    }

    var body: some View {
        ZStack {
            ForEach(0..<5, id: \.self) { i in
                if selectedTab == i {
                    tabContent(i)
                        .transition(tabTransition)
                        .zIndex(Double(10 + i))
                }
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.88), value: selectedTab)
        .safeAreaInset(edge: .bottom, spacing: 0) { tabBar }
        .environmentObject(houseVM)
        .onAppear {
            if let houseId = authVM.profile?.houseId {
                houseVM.setup(houseId: houseId)
            }
        }
        .onDisappear { houseVM.teardown() }
    }

    @ViewBuilder
    private func tabContent(_ i: Int) -> some View {
        switch i {
        case 0: DashboardView().environmentObject(houseVM).environmentObject(authVM)
        case 1: ExpensesView().environmentObject(houseVM).environmentObject(authVM)
        case 2: FixedCostsView().environmentObject(houseVM)
        case 3: ShoppingView().environmentObject(houseVM).environmentObject(authVM)
        case 4: ChartsView().environmentObject(houseVM)
        default: Color.appBg
        }
    }

    private var tabBar: some View {
        VStack(spacing: 0) {
            Rectangle().fill(Color.appBorder).frame(height: 0.5)
            HStack(spacing: 0) {
                ForEach(0..<5, id: \.self) { i in tabBtn(i) }
            }
            .padding(.horizontal, 6)
            .padding(.top, 10)
            .padding(.bottom, 6)
        }
        .background(Color.appSurface.ignoresSafeArea())
    }

    private func tabBtn(_ i: Int) -> some View {
        let sel = selectedTab == i
        let b   = badge(i)
        return Button {
            guard selectedTab != i else { return }
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            prevTab = selectedTab
            withAnimation(.spring(response: 0.4, dampingFraction: 0.88)) {
                selectedTab = i
            }
        } label: {
            VStack(spacing: 4) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: sel ? icons[i].1 : icons[i].0)
                        .font(.system(size: 20, weight: sel ? .semibold : .regular))
                        .foregroundStyle(sel ? Color.appPrimary : Color.appMuted)
                        .scaleEffect(sel ? 1.14 : 1.0)
                        .animation(.spring(response: 0.28, dampingFraction: 0.6), value: sel)

                    if b > 0 {
                        Text("\(min(b, 99))")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 4).padding(.vertical, 2)
                            .background(Color.appWarning)
                            .clipShape(Capsule())
                            .offset(x: 10, y: -7)
                            .transition(.scale.combined(with: .opacity))
                    }
                }
                .frame(width: 28, height: 28)
                .animation(.spring(response: 0.28), value: b)

                Text(label(i))
                    .font(.system(size: 10, weight: sel ? .semibold : .regular))
                    .foregroundStyle(sel ? Color.appPrimary : Color.appMuted)
                    .animation(.easeInOut(duration: 0.18), value: sel)

                // Selected dot indicator
                Circle()
                    .fill(sel ? Color.appPrimary : Color.clear)
                    .frame(width: 4, height: 4)
                    .animation(.spring(response: 0.28, dampingFraction: 0.7), value: sel)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(PressScaleStyle())
    }
}
