import Foundation
import FirebaseFirestore

struct UserProfile: Codable, Identifiable {
    @DocumentID var id: String?
    var uid: String
    var email: String
    var displayName: String
    var houseId: String?
    var pendingHouseId: String?
}

struct JoinRequest: Codable, Identifiable {
    @DocumentID var id: String?
    var uid: String
    var name: String
    var email: String
    @ServerTimestamp var requestedAt: Timestamp?
}

struct HouseMember: Codable, Hashable {
    var uid: String
    var name: String
}

struct House: Codable, Identifiable {
    @DocumentID var id: String?
    var name: String
    var code: String
    var memberIds: [String]
    var members: [HouseMember]
    @ServerTimestamp var createdAt: Timestamp?
}

struct Expense: Codable, Identifiable {
    @DocumentID var id: String?
    var userId: String
    var userName: String
    var desc: String
    var amount: Double
    var category: String
    var note: String
    var monthKey: String
    @ServerTimestamp var date: Timestamp?
}

struct FixedCost: Codable, Identifiable {
    @DocumentID var id: String?
    var name: String
    var amount: Double
    var type: String
    var dayOfMonth: Int
}

struct Settlement: Identifiable {
    let id = UUID()
    let fromName: String
    let toName: String
    let amount: Double
}

struct ShoppingItem: Codable, Identifiable {
    @DocumentID var id: String?
    var name: String
    var qty: String
    var checked: Bool
    var addedBy: String
    @ServerTimestamp var addedAt: Timestamp?
}
