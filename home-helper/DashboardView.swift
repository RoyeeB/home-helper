import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @EnvironmentObject var houseVM: HouseViewModel
    @AppStorage("isHebrew") private var isHebrew = true
    @State private var showLogoutAlert = false
    @State private var showHouseInfo = false
    @State private var showAddExpense = false
    @State private var showAddShopping = false
    @State private var appeared = false

    var monthKey: String { currentMonthKey() }
    var monthExpenses: [Expense]  { houseVM.expenses.filter { $0.monthKey == monthKey } }
    var variableTotal: Double     { monthExpenses.reduce(0) { $0 + $1.amount } }
    var fixedTotal: Double        { houseVM.fixedCosts.reduce(0) { $0 + $1.amount } }
    var grandTotal: Double        { variableTotal + fixedTotal }
    var memberTotals: [(HouseMember, Double)] {
        (houseVM.house?.members ?? []).map { m in
            (m, monthExpenses.filter { $0.userId == m.uid }.reduce(0) { $0 + $1.amount })
        }.sorted { $0.1 > $1.1 }
    }
    var settlements: [Settlement] { houseVM.settlements(for: monthKey) }
    var last5: [Expense]          { Array(monthExpenses.prefix(5)) }

    var body: some View {
        NavigationStack {
            ZStack { Color.appBg.ignoresSafeArea()
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 18) {

                        // ── Hero card ──────────────────────────
                        GradientCard {
                            VStack(spacing: 18) {
                                HStack {
                                    Spacer()
                                    Text(monthKeyLabel(monthKey))
                                        .font(.caption).fontWeight(.medium)
                                        .foregroundColor(.white.opacity(0.7))
                                        .padding(.horizontal, 10).padding(.vertical, 4)
                                        .background(.white.opacity(0.12))
                                        .clipShape(Capsule())
                                }

                                VStack(spacing: 4) {
                                    Text(isHebrew ? "סה״כ חודשי" : "Monthly Total")
                                        .font(.caption).foregroundColor(.white.opacity(0.65))
                                    Text(shekelFormat(grandTotal))
                                        .font(.system(size: 46, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                }

                                HStack(spacing: 10) {
                                    QuickActionButton(icon: "plus.circle.fill", label: isHebrew ? "הוצאה חדשה" : "New Expense") { showAddExpense = true }
                                    QuickActionButton(icon: "cart.badge.plus", label: isHebrew ? "רשימת קניות" : "Shopping") { showAddShopping = true }
                                }
                            }
                        }

                        // ── Mini stats ─────────────────────────
                        HStack(spacing: 10) {
                            miniStat(isHebrew ? "משתנות" : "Variable", shekelFormat(variableTotal), .appPrimary, icon: "arrow.up.circle.fill")
                            miniStat(isHebrew ? "קבועות"  : "Fixed",   shekelFormat(fixedTotal),   .appWarning, icon: "repeat.circle.fill")
                            miniStat(isHebrew ? "חברים"   : "Members", "\(houseVM.house?.members.count ?? 0)", .appSuccess, icon: "person.2.fill")
                        }

                        // ── Member breakdown ───────────────────
                        if !memberTotals.filter({ $0.1 > 0 }).isEmpty {
                            SectionLabel(title: isHebrew ? "פירוט לפי חבר" : "Member Breakdown")
                            CardView(padding: 0) {
                                VStack(spacing: 0) {
                                    ForEach(Array(memberTotals.enumerated()), id: \.element.0.uid) { idx, item in
                                        if idx > 0 { Divider().background(Color.appBorder).padding(.leading, 16) }
                                        memberRow(item.0, paid: item.1)
                                    }
                                }
                            }
                        }

                        // ── Settlement ─────────────────────────
                        if !settlements.isEmpty {
                            SectionLabel(title: isHebrew ? "התחשבנות" : "Settlement")
                            CardView {
                                VStack(spacing: 12) {
                                    ForEach(settlements) { s in
                                        settlementRow(s)
                                    }
                                }
                            }
                        } else if (houseVM.house?.members.count ?? 0) > 1 && grandTotal > 0 {
                            CardView {
                                HStack(spacing: 12) {
                                    VStack(alignment: .trailing, spacing: 3) {
                                        Text(isHebrew ? "כולם מסודרים!" : "All settled!").font(.subheadline.weight(.semibold)).foregroundColor(.white)
                                        Text(isHebrew ? "אין חובות החודש" : "No debts this month").font(.caption).foregroundColor(Color.appSecondary)
                                    }
                                    Spacer()
                                    ZStack {
                                        Circle().fill(Color.appSuccess.opacity(0.15))
                                        Image(systemName: "checkmark.seal.fill")
                                            .font(.title2).foregroundColor(Color.appSuccess)
                                    }
                                    .frame(width: 48, height: 48)
                                }
                            }
                        }

                        // ── Recent expenses ────────────────────
                        SectionLabel(title: isHebrew ? "הוצאות אחרונות" : "Recent Expenses",
                                     action: { showAddExpense = true },
                                     actionLabel: isHebrew ? "הוסף" : "Add")

                        if last5.isEmpty && !houseVM.isLoading {
                            CardView {
                                VStack(spacing: 12) {
                                    ZStack {
                                        Circle().fill(Color.appCardAlt)
                                        Image(systemName: "tray").font(.title2).foregroundColor(Color.appMuted)
                                    }.frame(width: 56, height: 56)
                                    Text(isHebrew ? "אין הוצאות החודש" : "No expenses this month").font(.subheadline).foregroundColor(Color.appSecondary)
                                    Button(isHebrew ? "הוסף הוצאה ראשונה" : "Add first expense") { showAddExpense = true }
                                        .font(.caption.weight(.semibold))
                                        .foregroundColor(Color.appPrimary)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                            }
                        } else if !last5.isEmpty {
                            CardView(padding: 0) {
                                VStack(spacing: 0) {
                                    ForEach(Array(last5.enumerated()), id: \.element.id) { idx, e in
                                        if idx > 0 { Divider().background(Color.appBorder).padding(.leading, 16) }
                                        expenseRow(e)
                                    }
                                }
                            }
                        }

                        Spacer(minLength: 20)
                    }
                    .padding(.horizontal, DS.paddingL)
                    .padding(.top, 12)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 18)
                    .onAppear {
                        withAnimation(.spring(response: 0.55, dampingFraction: 0.82)) { appeared = true }
                    }
                }
            }
            .navigationTitle(isHebrew ? "דשבורד" : "Dashboard")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { showLogoutAlert = true } label: {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                            .font(.body)
                            .foregroundColor(Color.appSecondary)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button { showHouseInfo = true } label: {
                        HStack(spacing: 5) {
                            Text(houseVM.house?.name ?? "")
                                .font(.subheadline.weight(.semibold))
                                .foregroundColor(.white)
                            Image(systemName: "chevron.down")
                                .font(.caption2.weight(.semibold))
                                .foregroundColor(Color.appSecondary)
                        }
                        .overlay(alignment: .topLeading) {
                            if !houseVM.joinRequests.isEmpty {
                                Circle().fill(Color.appWarning).frame(width: 8, height: 8).offset(x: -2, y: -2)
                            }
                        }
                    }
                }
            }
            .sheet(isPresented: $showAddExpense) {
                AddExpenseView().environmentObject(houseVM).environmentObject(authVM)
            }
            .sheet(isPresented: $showAddShopping) {
                AddShoppingItemView().environmentObject(houseVM).environmentObject(authVM)
            }
            .sheet(isPresented: $showHouseInfo) {
                HouseInfoSheet().environmentObject(houseVM)
            }
            .alert(isHebrew ? "התנתקות" : "Sign Out", isPresented: $showLogoutAlert) {
                Button(isHebrew ? "ביטול" : "Cancel", role: .cancel) {}
                Button(isHebrew ? "התנתק" : "Sign Out", role: .destructive) { try? authVM.logout() }
            }
        }
    }

    // MARK: - Sub views
    func miniStat(_ label: String, _ value: String, _ color: Color, icon: String) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon).font(.caption).foregroundColor(color)
            Text(value).font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(.white).minimumScaleFactor(0.6).lineLimit(1)
            Text(label).font(.caption2).foregroundColor(Color.appSecondary)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 14)
        .background(color.opacity(0.07))
        .clipShape(RoundedRectangle(cornerRadius: DS.radiusM))
        .overlay(RoundedRectangle(cornerRadius: DS.radiusM).stroke(color.opacity(0.2), lineWidth: 1))
    }

    func memberRow(_ m: HouseMember, paid: Double) -> some View {
        let pct = variableTotal > 0 ? min(paid / variableTotal, 1) : 0
        return HStack(spacing: 12) {
            VStack(alignment: .trailing, spacing: 8) {
                HStack {
                    Text(shekelFormat(paid)).font(.subheadline.weight(.bold)).foregroundColor(.white)
                    Spacer()
                    Text(m.name).font(.subheadline).foregroundColor(.white)
                }
                GeometryReader { geo in
                    ZStack(alignment: .trailing) {
                        RoundedRectangle(cornerRadius: 4).fill(Color.appCardAlt).frame(height: 5)
                        RoundedRectangle(cornerRadius: 4)
                            .fill(LinearGradient.primary)
                            .frame(width: max(geo.size.width * pct, pct > 0 ? 8 : 0), height: 5)
                    }
                }.frame(height: 5)
            }
            AvatarView(name: m.name)
        }
        .padding(.horizontal, DS.paddingM).padding(.vertical, 14)
    }

    func settlementRow(_ s: Settlement) -> some View {
        HStack(spacing: 10) {
            Text(shekelFormat(s.amount))
                .font(.subheadline.weight(.bold)).foregroundColor(Color.appDanger)
            Spacer()
            HStack(spacing: 6) {
                Text(s.toName).font(.subheadline.weight(.semibold)).foregroundColor(Color.appSuccess)
                Image(systemName: "arrow.right").font(.caption2.weight(.bold)).foregroundColor(Color.appMuted)
                Text(s.fromName).font(.subheadline).foregroundColor(.white)
            }
        }
        .padding(.vertical, 2)
    }

    func expenseRow(_ e: Expense) -> some View {
        HStack(spacing: 12) {
            // Left: amount
            Text(shekelFormat(e.amount))
                .font(.subheadline.weight(.bold))
                .foregroundColor(.white)
                .frame(minWidth: 64, alignment: .leading)

            Spacer()

            // Right: name + icon
            HStack(spacing: 10) {
                VStack(alignment: .trailing, spacing: 3) {
                    Text(e.desc).font(.subheadline.weight(.medium)).foregroundColor(.white).lineLimit(1)
                    Text("\(e.userName) · \((isHebrew ? categoryLabels : categoryLabelsEn)[e.category] ?? e.category)")
                        .font(.caption).foregroundColor(Color.appSecondary)
                }
                CategoryBadge(category: e.category)
            }
        }
        .padding(.horizontal, DS.paddingM).padding(.vertical, 13)
    }
}
