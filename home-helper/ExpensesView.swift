import SwiftUI

struct ExpensesView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @EnvironmentObject var houseVM: HouseViewModel
    @AppStorage("isHebrew") private var isHebrew = true
    @State private var selectedMonth = currentMonthKey()
    @State private var showAdd = false
    @State private var searchText = ""

    let months = last12Months()

    var filtered: [Expense] {
        let byMonth = houseVM.expenses.filter { $0.monthKey == selectedMonth }
        guard !searchText.isEmpty else { return byMonth }
        let q = searchText.lowercased()
        return byMonth.filter {
            $0.desc.lowercased().contains(q) ||
            $0.userName.lowercased().contains(q) ||
            (categoryLabels[$0.category] ?? "").contains(q)
        }
    }
    var total: Double { filtered.reduce(0) { $0 + $1.amount } }

    var body: some View {
        NavigationStack {
            ZStack { Color.appBg.ignoresSafeArea()
                VStack(spacing: 0) {

                    // Month chips
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(months, id: \.self) { mk in
                                MonthChip(label: monthKeyLabel(mk), selected: selectedMonth == mk) { selectedMonth = mk }
                            }
                        }
                        .padding(.horizontal, DS.paddingL).padding(.vertical, 12)
                    }

                    // Search
                    HStack(spacing: 8) {
                        Image(systemName: "magnifyingglass").foregroundColor(Color.appMuted).font(.subheadline)
                        TextField(isHebrew ? "חיפוש הוצאות..." : "Search expenses...", text: $searchText)
                            .foregroundColor(.white).multilineTextAlignment(.trailing)
                        if !searchText.isEmpty {
                            Button { searchText = "" } label: {
                                Image(systemName: "xmark.circle.fill").foregroundColor(Color.appMuted)
                            }
                        }
                    }
                    .padding(.horizontal, 12).padding(.vertical, 10)
                    .background(Color.appCard)
                    .clipShape(RoundedRectangle(cornerRadius: DS.radiusS))
                    .overlay(RoundedRectangle(cornerRadius: DS.radiusS).stroke(Color.appBorder, lineWidth: 1))
                    .padding(.horizontal, DS.paddingL).padding(.bottom, 10)

                    if filtered.isEmpty {
                        Spacer()
                        VStack(spacing: 14) {
                            Text(searchText.isEmpty ? "💸" : "🔍").font(.system(size: 50))
                            Text(searchText.isEmpty ? (isHebrew ? "אין הוצאות לחודש זה" : "No expenses this month") : (isHebrew ? "לא נמצאו תוצאות" : "No results found"))
                                .font(.headline).foregroundColor(Color.appSecondary)
                            if searchText.isEmpty {
                                Button(isHebrew ? "הוסף הוצאה" : "Add Expense") { showAdd = true }
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundColor(Color.appPrimary)
                            }
                        }
                        Spacer()
                    } else {
                        List {
                            ForEach(filtered) { e in
                                expenseRow(e)
                                    .listRowBackground(Color.appCard)
                                    .listRowSeparatorTint(Color.appBorder)
                                    .listRowInsets(EdgeInsets(top: 0, leading: 16, bottom: 0, trailing: 16))
                                    .swipeActions(edge: .leading, allowsFullSwipe: true) {
                                        Button(role: .destructive) {
                                            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                            Task { try? await houseVM.deleteExpense(e.id ?? "") }
                                        } label: { Label(isHebrew ? "מחיקה" : "Delete", systemImage: "trash") }
                                    }
                            }
                        }
                        .listStyle(.plain)
                        .scrollContentBackground(.hidden)
                    }
                }
            }
            .navigationTitle((isHebrew ? "הוצאות" : "Expenses") + " · \(shekelFormat(total))")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { showAdd = true } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2).foregroundColor(Color.appPrimary)
                    }
                }
            }
            .sheet(isPresented: $showAdd) {
                AddExpenseView().environmentObject(authVM).environmentObject(houseVM)
            }
        }
    }

    func expenseRow(_ e: Expense) -> some View {
        HStack(spacing: 12) {
            // Left: amount + category badge
            VStack(alignment: .center, spacing: 5) {
                Text(shekelFormat(e.amount))
                    .font(.subheadline.weight(.bold))
                    .foregroundColor(.white)
                Text((isHebrew ? categoryLabels : categoryLabelsEn)[e.category] ?? e.category)
                    .font(.caption2.weight(.semibold))
                    .padding(.horizontal, 7).padding(.vertical, 3)
                    .background((categoryColors[e.category] ?? Color.appSecondary).opacity(0.18))
                    .foregroundColor(categoryColors[e.category] ?? Color.appSecondary)
                    .clipShape(RoundedRectangle(cornerRadius: 6))
            }
            .frame(minWidth: 72, alignment: .center)

            Spacer()

            // Right: name + sub-info next to icon
            HStack(spacing: 10) {
                VStack(alignment: .trailing, spacing: 3) {
                    Text(e.desc)
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    HStack(spacing: 5) {
                        if let date = e.date?.dateValue() {
                            Text(date.formatted(.dateTime.day().month()))
                                .font(.caption).foregroundColor(Color.appMuted)
                            Text("·").font(.caption).foregroundColor(Color.appMuted)
                        }
                        Text(e.userName).font(.caption).foregroundColor(Color.appSecondary)
                    }
                }
                CategoryBadge(category: e.category)
            }
        }
        .padding(.vertical, 12)
    }
}

struct AddExpenseView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @EnvironmentObject var houseVM: HouseViewModel
    @Environment(\.dismiss) var dismiss
    @AppStorage("isHebrew") private var isHebrew = true
    @State private var desc = ""
    @State private var amount = ""
    @State private var category = "food"
    @State private var note = ""
    @State private var loading = false
    @State private var errorMsg = ""

    var body: some View {
        NavigationStack {
            ZStack { Color.appBg.ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 20) {
                        StyledTextField(label: isHebrew ? "תיאור" : "Description", placeholder: isHebrew ? "לדוגמה: קניות סופר" : "e.g. Groceries", text: $desc)
                        StyledTextField(label: isHebrew ? "סכום (₪)" : "Amount (₪)", placeholder: "0.00", text: $amount, keyboardType: .decimalPad)

                        VStack(alignment: isHebrew ? .trailing : .leading, spacing: 10) {
                            Text(isHebrew ? "קטגוריה" : "Category").font(.caption.weight(.medium)).foregroundColor(Color.appSecondary)
                            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 8) {
                                ForEach(categories, id: \.self) { cat in
                                    Button { category = cat } label: {
                                        VStack(spacing: 4) {
                                            Image(systemName: categoryIcons[cat] ?? "circle.fill")
                                                .font(.system(size: 16))
                                                .foregroundColor(category == cat ? .white : categoryColors[cat] ?? .appSecondary)
                                            Text((isHebrew ? categoryLabels : categoryLabelsEn)[cat] ?? cat)
                                                .font(.caption2.weight(.medium))
                                                .foregroundColor(category == cat ? .white : Color.appSecondary)
                                        }
                                        .frame(maxWidth: .infinity).padding(.vertical, 10)
                                        .background(category == cat ? (categoryColors[cat] ?? Color.appPrimary) : Color.appCardAlt)
                                        .clipShape(RoundedRectangle(cornerRadius: DS.radiusS))
                                        .overlay(RoundedRectangle(cornerRadius: DS.radiusS)
                                            .stroke(categoryColors[cat]?.opacity(0.3) ?? Color.appBorder, lineWidth: 1))
                                    }
                                }
                            }
                        }

                        StyledTextField(label: isHebrew ? "הערה (אופציונלי)" : "Note (optional)", placeholder: isHebrew ? "פרטים נוספים..." : "Extra details...", text: $note)

                        if !errorMsg.isEmpty {
                            Text(errorMsg).font(.caption).foregroundColor(Color.appDanger)
                                .frame(maxWidth: .infinity, alignment: isHebrew ? .trailing : .leading)
                        }

                        PrimaryButton(isHebrew ? "שמירה" : "Save", loading: loading) { Task { await save() } }
                    }
                    .padding(DS.paddingL)
                }
            }
            .navigationTitle(isHebrew ? "הוצאה חדשה" : "New Expense")
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
        guard !desc.isEmpty, let amt = Double(amount.replacingOccurrences(of: ",", with: ".")), amt > 0 else {
            errorMsg = isHebrew ? "יש למלא תיאור וסכום תקין" : "Enter a description and valid amount"; return
        }
        guard let profile = authVM.profile else { return }
        loading = true; errorMsg = ""
        do {
            try await houseVM.addExpense(desc: desc.trimmingCharacters(in: .whitespaces),
                                         amount: amt, category: category,
                                         note: note.trimmingCharacters(in: .whitespaces),
                                         userName: profile.displayName, userId: profile.uid)
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            dismiss()
        } catch { errorMsg = isHebrew ? "שגיאה בשמירת ההוצאה" : "Error saving expense" }
        loading = false
    }
}
