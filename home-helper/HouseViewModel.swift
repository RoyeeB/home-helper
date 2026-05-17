import Foundation
import FirebaseFirestore

@MainActor
class HouseViewModel: ObservableObject {
    @Published var house: House?
    @Published var expenses: [Expense] = []
    @Published var fixedCosts: [FixedCost] = []
    @Published var shoppingItems: [ShoppingItem] = []
    @Published var joinRequests: [JoinRequest] = []
    @Published var isLoading = true

    private var houseId: String = ""
    private var listeners: [ListenerRegistration] = []
    private let db = Firestore.firestore()

    func setup(houseId: String) {
        guard houseId != self.houseId else { return }
        teardown()
        self.houseId = houseId
        isLoading = true
        attachListeners()
    }

    func teardown() {
        listeners.forEach { $0.remove() }
        listeners = []
    }

    private func houseRef() -> DocumentReference {
        db.collection("houses").document(houseId)
    }

    private func attachListeners() {
        let l1 = houseRef().addSnapshotListener { [weak self] snap, _ in
            self?.house = try? snap?.data(as: House.self)
            self?.isLoading = false
        }

        let l2 = houseRef().collection("expenses")
            .order(by: "date", descending: true)
            .addSnapshotListener { [weak self] snap, _ in
                self?.expenses = snap?.documents.compactMap { try? $0.data(as: Expense.self) } ?? []
            }

        let l3 = houseRef().collection("fixedCosts")
            .addSnapshotListener { [weak self] snap, _ in
                self?.fixedCosts = snap?.documents.compactMap { try? $0.data(as: FixedCost.self) } ?? []
            }

        let l4 = houseRef().collection("shopping")
            .order(by: "addedAt", descending: false)
            .addSnapshotListener { [weak self] snap, _ in
                self?.shoppingItems = snap?.documents.compactMap { try? $0.data(as: ShoppingItem.self) } ?? []
            }

        let l5 = houseRef().collection("joinRequests")
            .addSnapshotListener { [weak self] snap, _ in
                self?.joinRequests = snap?.documents.compactMap { try? $0.data(as: JoinRequest.self) } ?? []
            }

        listeners = [l1, l2, l3, l4, l5]
    }

    // MARK: - Expenses
    func addExpense(desc: String, amount: Double, category: String, note: String, userName: String, userId: String) async throws {
        let data: [String: Any] = [
            "userId": userId,
            "userName": userName,
            "desc": desc,
            "amount": amount,
            "category": category,
            "note": note,
            "monthKey": currentMonthKey(),
            "date": FieldValue.serverTimestamp()
        ]
        try await houseRef().collection("expenses").addDocument(data: data)
    }

    func deleteExpense(_ id: String) async throws {
        try await houseRef().collection("expenses").document(id).delete()
    }

    // MARK: - Fixed Costs
    func addFixedCost(name: String, amount: Double, type: String, dayOfMonth: Int) async throws {
        let data: [String: Any] = ["name": name, "amount": amount, "type": type, "dayOfMonth": dayOfMonth]
        try await houseRef().collection("fixedCosts").addDocument(data: data)
    }

    func updateFixedCost(_ id: String, name: String, amount: Double, type: String, dayOfMonth: Int) async throws {
        let data: [String: Any] = ["name": name, "amount": amount, "type": type, "dayOfMonth": dayOfMonth]
        try await houseRef().collection("fixedCosts").document(id).updateData(data)
    }

    func deleteFixedCost(_ id: String) async throws {
        try await houseRef().collection("fixedCosts").document(id).delete()
    }

    // MARK: - Settlement
    func settlements(for monthKey: String) -> [Settlement] {
        let monthExpenses = expenses.filter { $0.monthKey == monthKey }
        let members = house?.members ?? []
        guard members.count > 1 else { return [] }
        let total = monthExpenses.reduce(0) { $0 + $1.amount }
        guard total > 0 else { return [] }
        let fair = total / Double(members.count)

        var balances = members.map { m -> (name: String, bal: Double) in
            let paid = monthExpenses.filter { $0.userId == m.uid }.reduce(0) { $0 + $1.amount }
            return (m.name, paid - fair)
        }

        var result: [Settlement] = []
        var ci = 0, di = 0
        var creditors = balances.filter { $0.bal > 0.5 }.sorted { $0.bal > $1.bal }
        var debtors   = balances.filter { $0.bal < -0.5 }.sorted { $0.bal < $1.bal }

        while ci < creditors.count && di < debtors.count {
            let amount = min(creditors[ci].bal, -debtors[di].bal)
            result.append(Settlement(fromName: debtors[di].name, toName: creditors[ci].name, amount: amount))
            creditors[ci].bal -= amount
            debtors[di].bal   += amount
            if creditors[ci].bal < 0.5 { ci += 1 }
            if debtors[di].bal > -0.5  { di += 1 }
        }
        return result
    }

    // MARK: - Join Requests
    func approveRequest(_ request: JoinRequest) async throws {
        guard let reqId = request.id else { return }
        try await houseRef().updateData([
            "memberIds": FieldValue.arrayUnion([request.uid]),
            "members": FieldValue.arrayUnion([["uid": request.uid, "name": request.name]])
        ])
        try await db.collection("users").document(request.uid).updateData([
            "houseId": houseId,
            "pendingHouseId": FieldValue.delete()
        ])
        try await houseRef().collection("joinRequests").document(reqId).delete()
    }

    func denyRequest(_ request: JoinRequest) async throws {
        guard let reqId = request.id else { return }
        try await db.collection("users").document(request.uid).updateData([
            "pendingHouseId": FieldValue.delete()
        ])
        try await houseRef().collection("joinRequests").document(reqId).delete()
    }

    // MARK: - Shopping
    func addShoppingItem(name: String, qty: String, addedBy: String) async throws {
        let data: [String: Any] = [
            "name": name, "qty": qty, "checked": false,
            "addedBy": addedBy, "addedAt": FieldValue.serverTimestamp()
        ]
        try await houseRef().collection("shopping").addDocument(data: data)
    }

    func toggleShoppingItem(_ id: String, checked: Bool) async throws {
        try await houseRef().collection("shopping").document(id).updateData(["checked": checked])
    }

    func clearCheckedItems() async throws {
        let toDelete = shoppingItems.filter { $0.checked }.compactMap { $0.id }
        try await withThrowingTaskGroup(of: Void.self) { group in
            for id in toDelete {
                group.addTask { [weak self] in
                    guard let self else { return }
                    try await self.houseRef().collection("shopping").document(id).delete()
                }
            }
            try await group.waitForAll()
        }
    }
}
