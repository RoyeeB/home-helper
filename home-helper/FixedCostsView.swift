import SwiftUI

struct FixedCostsView: View {
    @EnvironmentObject var houseVM: HouseViewModel
    @AppStorage("isHebrew") private var isHebrew = true
    @State private var showSheet = false
    @State private var editing: FixedCost?

    var total: Double { houseVM.fixedCosts.reduce(0) { $0 + $1.amount } }

    var body: some View {
        NavigationStack {
            ZStack { Color.appBg.ignoresSafeArea()
                if houseVM.fixedCosts.isEmpty {
                    VStack(spacing: 16) {
                        Text("🔄").font(.system(size: 56))
                        Text(isHebrew ? "אין הוצאות קבועות" : "No fixed costs").font(.headline.weight(.semibold)).foregroundColor(.white)
                        Text(isHebrew ? "הוסף שכירות, חשמל, מים ועוד" : "Add rent, electricity, water and more").font(.subheadline).foregroundColor(Color.appSecondary)
                        Button(isHebrew ? "הוסף עכשיו" : "Add Now") { editing = nil; showSheet = true }
                            .font(.subheadline.weight(.semibold)).foregroundColor(Color.appPrimary)
                            .padding(.top, 4)
                    }
                } else {
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 12) {
                            // Total banner
                            GradientCard(gradient: .primary, padding: DS.paddingM) {
                                HStack {
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(isHebrew ? "חודשי" : "Monthly").font(.caption).foregroundColor(.white.opacity(0.7))
                                        Text(shekelFormat(total))
                                            .font(.system(size: 28, weight: .bold, design: .rounded))
                                            .foregroundColor(.white)
                                    }
                                    Spacer()
                                    VStack(alignment: .trailing, spacing: 3) {
                                        Text(isHebrew ? "שנתי" : "Annual").font(.caption).foregroundColor(.white.opacity(0.7))
                                        Text(shekelFormat(total * 12))
                                            .font(.headline.weight(.bold))
                                            .foregroundColor(.white.opacity(0.85))
                                    }
                                }
                            }

                            ForEach(houseVM.fixedCosts) { fc in
                                costCard(fc)
                            }
                        }
                        .padding(.horizontal, DS.paddingL)
                        .padding(.vertical, 12)
                    }
                }
            }
            .navigationTitle(isHebrew ? "הוצאות קבועות" : "Fixed Costs")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { editing = nil; showSheet = true } label: {
                        Image(systemName: "plus.circle.fill").font(.title2).foregroundColor(Color.appPrimary)
                    }
                }
            }
            .sheet(isPresented: $showSheet, onDismiss: { editing = nil }) {
                FixedCostFormView(existing: editing).environmentObject(houseVM)
            }
        }
    }

    func costCard(_ fc: FixedCost) -> some View {
        let info = fixedCostTypes.first(where: { $0.key == fc.type })
        return CardView {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10).fill(Color.appPrimary.opacity(0.12))
                    Image(systemName: info?.icon ?? "ellipsis.circle.fill")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(Color.appPrimary)
                }
                .frame(width: 44, height: 44)

                VStack(alignment: .trailing, spacing: 4) {
                    Text(isHebrew ? fc.name : (fixedCostLabelsEn[fc.type] ?? fc.name)).font(.subheadline.weight(.semibold)).foregroundColor(.white)
                    Text((isHebrew ? "יום " : "Day ") + "\(fc.dayOfMonth)" + (isHebrew ? " בחודש" : " of month")).font(.caption).foregroundColor(Color.appSecondary)
                }
                Spacer()
                VStack(alignment: .leading, spacing: 4) {
                    Text(shekelFormat(fc.amount)).font(.subheadline.weight(.bold)).foregroundColor(.white)
                    Text(isHebrew ? "לחודש" : "/month").font(.caption2).foregroundColor(Color.appMuted)
                }
                Image(systemName: "chevron.left").font(.caption).foregroundColor(Color.appMuted)
            }
        }
        .onTapGesture { editing = fc; showSheet = true }
        .swipeActions(edge: .leading, allowsFullSwipe: true) {
            Button(role: .destructive) {
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                Task { try? await houseVM.deleteFixedCost(fc.id ?? "") }
            } label: { Label(isHebrew ? "מחיקה" : "Delete", systemImage: "trash") }
        }
    }
}

struct FixedCostFormView: View {
    @EnvironmentObject var houseVM: HouseViewModel
    @Environment(\.dismiss) var dismiss
    let existing: FixedCost?

    @AppStorage("isHebrew") private var isHebrew = true
    @State private var type = "rent"
    @State private var amount = ""
    @State private var dayOfMonth = "1"
    @State private var loading = false
    @State private var errorMsg = ""

    init(existing: FixedCost?) {
        self.existing = existing
        if let fc = existing {
            _type = State(initialValue: fc.type)
            _amount = State(initialValue: String(Int(fc.amount)))
            _dayOfMonth = State(initialValue: String(fc.dayOfMonth))
        }
    }

    var body: some View {
        NavigationStack {
            ZStack { Color.appBg.ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 20) {
                        VStack(alignment: .trailing, spacing: 10) {
                            Text(isHebrew ? "סוג הוצאה" : "Cost Type").font(.caption.weight(.medium)).foregroundColor(Color.appSecondary)
                            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 8) {
                                ForEach(fixedCostTypes, id: \.key) { t in
                                    Button { type = t.key } label: {
                                        HStack(spacing: 10) {
                                            Image(systemName: t.icon)
                                                .font(.subheadline)
                                                .foregroundColor(type == t.key ? .white : Color.appPrimary)
                                                .frame(width: 20)
                                            Text(isHebrew ? t.label : (fixedCostLabelsEn[t.key] ?? t.label))
                                                .font(.subheadline)
                                                .foregroundColor(type == t.key ? .white : Color.appSecondary)
                                            Spacer()
                                        }
                                        .padding(12)
                                        .background(type == t.key ? Color.appPrimary : Color.appCardAlt)
                                        .clipShape(RoundedRectangle(cornerRadius: DS.radiusS))
                                        .overlay(RoundedRectangle(cornerRadius: DS.radiusS)
                                            .stroke(type == t.key ? Color.clear : Color.appBorder, lineWidth: 1))
                                    }
                                }
                            }
                        }

                        StyledTextField(label: isHebrew ? "סכום חודשי (₪)" : "Monthly Amount (₪)", placeholder: "0", text: $amount, keyboardType: .numberPad)
                        StyledTextField(label: isHebrew ? "יום חיוב בחודש (1-31)" : "Billing Day (1-31)", placeholder: "1", text: $dayOfMonth, keyboardType: .numberPad)

                        if !errorMsg.isEmpty {
                            Text(errorMsg).font(.caption).foregroundColor(Color.appDanger)
                                .frame(maxWidth: .infinity, alignment: isHebrew ? .trailing : .leading)
                        }

                        PrimaryButton(existing == nil ? (isHebrew ? "הוספה" : "Add") : (isHebrew ? "עדכון" : "Update"), loading: loading) { Task { await save() } }
                    }
                    .padding(DS.paddingL)
                }
            }
            .navigationTitle(existing == nil ? (isHebrew ? "הוצאה קבועה חדשה" : "New Fixed Cost") : (isHebrew ? "עריכה" : "Edit"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(isHebrew ? "ביטול" : "Cancel") { dismiss() }.foregroundColor(Color.appSecondary)
                }
            }
        }
        .presentationDetents([.large])
        .preferredColorScheme(.dark)
        .environment(\.layoutDirection, isHebrew ? .rightToLeft : .leftToRight)
    }

    func save() async {
        guard let amt = Double(amount.replacingOccurrences(of: ",", with: ".")), amt > 0 else {
            errorMsg = isHebrew ? "סכום לא תקין" : "Invalid amount"; return
        }
        guard let day = Int(dayOfMonth), day >= 1, day <= 31 else {
            errorMsg = isHebrew ? "יום לא תקין (1-31)" : "Invalid day (1-31)"; return
        }
        let label = fixedCostTypes.first(where: { $0.key == type })?.label ?? type
        loading = true; errorMsg = ""
        do {
            if let fc = existing, let id = fc.id {
                try await houseVM.updateFixedCost(id, name: label, amount: amt, type: type, dayOfMonth: day)
            } else {
                try await houseVM.addFixedCost(name: label, amount: amt, type: type, dayOfMonth: day)
            }
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            dismiss()
        } catch { errorMsg = isHebrew ? "שגיאה בשמירה" : "Save error" }
        loading = false
    }
}
