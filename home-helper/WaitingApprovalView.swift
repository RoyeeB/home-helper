import SwiftUI
import FirebaseFirestore

struct WaitingApprovalView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @AppStorage("isHebrew") private var isHebrew = true
    @State private var cancelling = false

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()
            VStack(spacing: 28) {
                Spacer()
                ProgressView()
                    .progressViewStyle(.circular)
                    .tint(Color.appPrimary)
                    .scaleEffect(1.8)

                VStack(spacing: 10) {
                    Text(isHebrew ? "ממתין לאישור" : "Awaiting Approval")
                        .font(.system(size: 26, weight: .bold))
                        .foregroundColor(.white)
                    Text(isHebrew ? "בקשתך נשלחה לבני הבית.\nכשיאשרו אותך תועבר אוטומטית." : "Your request was sent to the household.\nYou'll be added automatically once approved.")
                        .font(.subheadline)
                        .foregroundColor(Color.appSecondary)
                        .multilineTextAlignment(.center)
                }

                PrimaryButton(isHebrew ? "ביטול הבקשה" : "Cancel Request", loading: cancelling) {
                    Task { await cancelRequest() }
                }
                .padding(.horizontal, 40)

                Button(isHebrew ? "התנתקות" : "Sign Out") { try? authVM.logout() }
                    .font(.footnote)
                    .foregroundColor(Color.appMuted)

                Spacer()
            }
            .padding(.horizontal, 24)
        }
        .preferredColorScheme(.dark)
    }

    func cancelRequest() async {
        guard let profile = authVM.profile, let pendingId = profile.pendingHouseId else { return }
        cancelling = true
        let db = Firestore.firestore()
        try? await db.collection("houses").document(pendingId)
            .collection("joinRequests").document(profile.uid).delete()
        try? await db.collection("users").document(profile.uid)
            .updateData(["pendingHouseId": FieldValue.delete()])
        cancelling = false
    }
}
