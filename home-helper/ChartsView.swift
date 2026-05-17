import SwiftUI
import Charts

struct ChartsView: View {
    @EnvironmentObject var houseVM: HouseViewModel
    @AppStorage("isHebrew") private var isHebrew = true
    @State private var selectedMonth = currentMonthKey()
    let months = last12Months()

    var monthExpenses: [Expense] {
        houseVM.expenses.filter { $0.monthKey == selectedMonth }
    }
    var fixedTotal: Double { houseVM.fixedCosts.reduce(0) { $0 + $1.amount } }

    // Category donut data
    struct CatData: Identifiable {
        var id: String { category }
        let category: String
        let amount: Double
        var color: Color { categoryColors[category] ?? Color.appSecondary }
        var label: String { categoryLabels[category] ?? category }
    }
    var catData: [CatData] {
        categories.compactMap { cat in
            let total = monthExpenses.filter { $0.category == cat }.reduce(0) { $0 + $1.amount }
            return total > 0 ? CatData(category: cat, amount: total) : nil
        }
    }
    var catTotal: Double { catData.reduce(0) { $0 + $1.amount } }

    // Monthly bar data
    struct MonthData: Identifiable {
        var id: String { monthKey }
        let monthKey: String
        let total: Double
        var label: String { String(monthKey.suffix(2)) }
    }
    var monthlyData: [MonthData] {
        last6MonthsOrdered().map { mk in
            let v = houseVM.expenses.filter { $0.monthKey == mk }.reduce(0) { $0 + $1.amount }
            return MonthData(monthKey: mk, total: v + fixedTotal)
        }
    }

    // Per-member bar data
    struct MemberData: Identifiable {
        var id: String { uid }
        let uid: String
        let name: String
        let paid: Double
    }
    var memberData: [MemberData] {
        (houseVM.house?.members ?? []).map { m in
            let paid = monthExpenses.filter { $0.userId == m.uid }.reduce(0) { $0 + $1.amount }
            return MemberData(uid: m.uid, name: String(m.name.prefix(6)), paid: paid)
        }.filter { $0.paid > 0 }
    }

    var body: some View {
        NavigationStack {
            ZStack { Color.appBg.ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 20) {
                        // Month selector
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(months, id: \.self) { mk in
                                    Button(monthKeyLabel(mk)) { selectedMonth = mk }
                                        .font(.caption).fontWeight(.medium)
                                        .padding(.horizontal, 14).padding(.vertical, 8)
                                        .background(selectedMonth == mk ? Color.appPrimary : Color.appCard)
                                        .foregroundColor(selectedMonth == mk ? .white : Color.appSecondary)
                                        .cornerRadius(20)
                                        .overlay(RoundedRectangle(cornerRadius: 20)
                                            .stroke(Color.appBorder, lineWidth: selectedMonth == mk ? 0 : 1))
                                }
                            }
                            .padding(.horizontal, 4)
                        }

                        // Donut chart
                        CardView {
                            VStack(alignment: .trailing, spacing: 16) {
                                VStack(alignment: .trailing, spacing: 4) {
                                    Text(isHebrew ? "הוצאות לפי קטגוריה" : "Expenses by Category").font(.headline).foregroundColor(.white)
                                    Text(monthKeyLabel(selectedMonth)).font(.caption).foregroundColor(Color.appSecondary)
                                }
                                if catData.isEmpty {
                                    Text(isHebrew ? "אין נתונים לחודש זה" : "No data for this month")
                                        .foregroundColor(Color.appMuted)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 30)
                                } else {
                                    HStack(spacing: 20) {
                                        Chart(catData) { d in
                                            SectorMark(
                                                angle: .value("סכום", d.amount),
                                                innerRadius: .ratio(0.6),
                                                angularInset: 2
                                            )
                                            .foregroundStyle(d.color)
                                            .cornerRadius(4)
                                        }
                                        .frame(width: 160, height: 160)
                                        .overlay {
                                            VStack(spacing: 2) {
                                                Text(shekelFormat(catTotal))
                                                    .font(.system(size: 15, weight: .bold))
                                                    .foregroundColor(.white)
                                                Text(isHebrew ? "סה״כ" : "Total").font(.caption2).foregroundColor(Color.appSecondary)
                                            }
                                        }

                                        VStack(alignment: .trailing, spacing: 8) {
                                            ForEach(catData) { d in
                                                HStack(spacing: 6) {
                                                    Text(shekelFormat(d.amount))
                                                        .font(.caption).fontWeight(.semibold).foregroundColor(.white)
                                                    Text(isHebrew ? d.label : (categoryLabelsEn[d.category] ?? d.label)).font(.caption).foregroundColor(Color.appSecondary)
                                                    Circle().fill(d.color).frame(width: 8, height: 8)
                                                }
                                            }
                                        }
                                        Spacer()
                                    }
                                }
                            }
                        }

                        // Monthly bar chart
                        CardView {
                            VStack(alignment: .trailing, spacing: 16) {
                                VStack(alignment: .trailing, spacing: 4) {
                                    Text(isHebrew ? "הוצאות חודשיות" : "Monthly Expenses").font(.headline).foregroundColor(.white)
                                    Text(isHebrew ? "6 חודשים אחרונים" : "Last 6 months").font(.caption).foregroundColor(Color.appSecondary)
                                }
                                Chart(monthlyData) { d in
                                    BarMark(
                                        x: .value("חודש", d.label),
                                        y: .value("סכום", d.total)
                                    )
                                    .foregroundStyle(d.monthKey == selectedMonth ? Color.appPrimary : Color.appCardAlt)
                                    .cornerRadius(4)
                                    .annotation(position: .top) {
                                        Text(shekelFormat(d.total))
                                            .font(.system(size: 9))
                                            .foregroundColor(Color.appSecondary)
                                    }
                                }
                                .frame(height: 180)
                                .chartXAxis {
                                    AxisMarks { _ in
                                        AxisValueLabel().foregroundStyle(Color.appSecondary)
                                    }
                                }
                                .chartYAxis {
                                    AxisMarks { _ in
                                        AxisValueLabel().foregroundStyle(Color.appSecondary)
                                        AxisGridLine().foregroundStyle(Color.appBorder)
                                    }
                                }
                            }
                        }

                        // Per-member bar chart
                        if !memberData.isEmpty {
                            CardView {
                                VStack(alignment: .trailing, spacing: 16) {
                                    VStack(alignment: .trailing, spacing: 4) {
                                        Text(isHebrew ? "פירוט לפי חבר" : "Per Member").font(.headline).foregroundColor(.white)
                                        Text(monthKeyLabel(selectedMonth)).font(.caption).foregroundColor(Color.appSecondary)
                                    }
                                    let memberColors: [Color] = [.appPrimary, Color(hex: "34d399"), Color(hex: "a78bfa"), Color(hex: "f87171"), Color(hex: "fbbf24")]
                                    Chart(Array(memberData.enumerated()), id: \.element.id) { idx, d in
                                        BarMark(
                                            x: .value("חבר", d.name),
                                            y: .value("סכום", d.paid)
                                        )
                                        .foregroundStyle(memberColors[idx % memberColors.count])
                                        .cornerRadius(4)
                                        .annotation(position: .top) {
                                            Text(shekelFormat(d.paid))
                                                .font(.system(size: 9))
                                                .foregroundColor(Color.appSecondary)
                                        }
                                    }
                                    .frame(height: 160)
                                    .chartXAxis {
                                        AxisMarks { _ in
                                            AxisValueLabel().foregroundStyle(Color.appSecondary)
                                        }
                                    }
                                    .chartYAxis {
                                        AxisMarks { _ in
                                            AxisValueLabel().foregroundStyle(Color.appSecondary)
                                            AxisGridLine().foregroundStyle(Color.appBorder)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    .padding(20)
                }
            }
            .navigationTitle(isHebrew ? "גרפים" : "Charts")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}
