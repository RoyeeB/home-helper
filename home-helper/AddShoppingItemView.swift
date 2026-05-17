import SwiftUI

struct AddShoppingItemView: View {
    @EnvironmentObject var houseVM: HouseViewModel
    @EnvironmentObject var authVM: AuthViewModel
    @Environment(\.dismiss) var dismiss
    @AppStorage("isHebrew") private var isHebrew = true
    @State private var name = ""
    @State private var qty = ""
    @State private var loading = false

    var body: some View {
        ZStack { Color.appBg.ignoresSafeArea()
            VStack(spacing: 24) {
                HStack {
                    Spacer()
                    Button { dismiss() } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2).foregroundColor(Color.appSecondary)
                    }
                }

                Text(isHebrew ? "פריט חדש לקניות" : "New Shopping Item")
                    .font(.title2.bold()).foregroundColor(.white)

                StyledTextField(label: isHebrew ? "שם הפריט" : "Item name", placeholder: isHebrew ? "לדוגמה: חלב" : "e.g. Milk", text: $name)
                StyledTextField(label: isHebrew ? "כמות (אופציונלי)" : "Qty (optional)", placeholder: isHebrew ? "לדוגמה: 2 יחידות" : "e.g. 2 units", text: $qty)

                PrimaryButton(isHebrew ? "הוספה" : "Add", loading: loading) { Task { await add() } }

                Spacer()
            }
            .padding(24)
        }
    }

    func add() async {
        let n = name.trimmingCharacters(in: .whitespaces)
        guard !n.isEmpty, let profile = authVM.profile else { return }
        loading = true
        try? await houseVM.addShoppingItem(name: n, qty: qty.trimmingCharacters(in: .whitespaces), addedBy: profile.displayName)
        dismiss()
    }
}
