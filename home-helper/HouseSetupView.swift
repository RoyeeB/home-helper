import SwiftUI
import FirebaseFirestore

struct HouseSetupView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @AppStorage("isHebrew") private var isHebrew = true
    enum Mode { case pick, create, join }
    @State private var mode: Mode = .pick
    @State private var houseName = ""
    @State private var joinCode = ""
    @State private var loading = false
    @State private var errorMsg = ""
    @State private var createdCode = ""

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()

            if !createdCode.isEmpty {
                successView
            } else {
                ScrollView {
                    VStack(spacing: 32) {
                        Spacer(minLength: 40)
                        header

                        switch mode {
                        case .pick:   pickView
                        case .create: createView
                        case .join:   joinView
                        }

                        Button(isHebrew ? "התנתקות" : "Sign Out") { try? authVM.logout() }
                            .font(.footnote)
                            .foregroundColor(Color.appMuted)
                    }
                    .padding(.horizontal, 24)
                }
            }
        }
        .preferredColorScheme(.dark)
        .environment(\.layoutDirection, isHebrew ? .rightToLeft : .leftToRight)
    }

    var header: some View {
        VStack(spacing: 8) {
            Text(isHebrew ? "הגדרת בית" : "Household Setup")
                .font(.system(size: 28, weight: .bold)).foregroundColor(.white)
            Text(isHebrew ? "צור בית חדש או הצטרף לקיים" : "Create a new home or join an existing one")
                .foregroundColor(Color.appSecondary)
                .multilineTextAlignment(.center)
        }
    }

    var pickView: some View {
        VStack(spacing: 16) {
            optionCard(emoji: "🏠", title: isHebrew ? "יצירת בית חדש" : "Create New Home", desc: isHebrew ? "הגדר בית וקבל קוד הזמנה" : "Set up a home and get an invite code") {
                mode = .create
            }
            optionCard(emoji: "🔑", title: isHebrew ? "הצטרפות לבית" : "Join a Home", desc: isHebrew ? "הזן קוד שקיבלת מבן הבית" : "Enter a code from a household member") {
                mode = .join
            }
        }
    }

    var createView: some View {
        VStack(spacing: 16) {
            StyledTextField(label: isHebrew ? "שם הבית" : "Home Name", placeholder: isHebrew ? "לדוגמה: משפחת כהן" : "e.g. The Smiths", text: $houseName)
            errorText
            PrimaryButton(isHebrew ? "יצירת בית" : "Create Home", loading: loading) { Task { await createHouse() } }
            backButton
        }
    }

    var joinView: some View {
        VStack(spacing: 16) {
            StyledTextField(label: isHebrew ? "קוד הבית (6 ספרות)" : "Home Code (6 digits)", placeholder: "123456", text: $joinCode, keyboardType: .numberPad)
            errorText
            PrimaryButton(isHebrew ? "הצטרפות" : "Join", loading: loading) { Task { await joinHouse() } }
            backButton
        }
    }

    var successView: some View {
        VStack(spacing: 20) {
            Spacer()
            Text("🎉").font(.system(size: 60))
            Text(isHebrew ? "הבית נוצר!" : "Home Created!").font(.title.bold()).foregroundColor(.white)
            Text(isHebrew ? "שתף את הקוד הזה עם בני הבית:" : "Share this code with your household members:")
                .foregroundColor(Color.appSecondary)
                .multilineTextAlignment(.center)
            Text(createdCode)
                .font(.system(size: 36, weight: .bold, design: .monospaced))
                .kerning(6)
                .foregroundColor(Color.appPrimary)
                .padding(20)
                .background(Color.appCard)
                .cornerRadius(16)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.appPrimary, lineWidth: 2))
            Text(isHebrew ? "מעביר אותך לאפליקציה..." : "Taking you to the app...")
                .font(.caption)
                .foregroundColor(Color.appMuted)
            Spacer()
        }
    }

    @ViewBuilder var errorText: some View {
        if !errorMsg.isEmpty {
            Text(errorMsg).font(.caption).foregroundColor(Color.appDanger)
                .frame(maxWidth: .infinity, alignment: isHebrew ? .trailing : .leading)
        }
    }

    var backButton: some View {
        Button(isHebrew ? "חזרה" : "Back") { mode = .pick; errorMsg = "" }
            .foregroundColor(Color.appSecondary)
    }

    func optionCard(emoji: String, title: String, desc: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 10) {
                Text(emoji).font(.system(size: 36))
                Text(title).font(.headline).foregroundColor(.white)
                Text(desc).font(.caption).foregroundColor(Color.appSecondary).multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(24)
            .background(Color.appCard)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.appBorder, lineWidth: 1))
        }
    }

    func createHouse() async {
        guard !houseName.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMsg = isHebrew ? "יש להזין שם לבית" : "Please enter a home name"; return
        }
        guard let profile = authVM.profile else {
            errorMsg = isHebrew ? "פרופיל לא נטען – נסה להתנתק ולהתחבר שוב" : "Profile not loaded – try signing out and in"; return
        }
        loading = true; errorMsg = ""
        let code = String(Int.random(in: 100000...999999))
        let db = Firestore.firestore()
        do {
            let ref = db.collection("houses").document()
            try await ref.setData([
                "name": houseName.trimmingCharacters(in: .whitespaces),
                "code": code,
                "memberIds": [profile.uid],
                "members": [["uid": profile.uid, "name": profile.displayName]],
                "createdAt": FieldValue.serverTimestamp()
            ])
            try await db.collection("users").document(profile.uid).updateData(["houseId": ref.documentID])
            createdCode = code
            await authVM.refreshProfile()
            try await Task.sleep(nanoseconds: 2_500_000_000)
        } catch let err as NSError {
            errorMsg = "Error (\(err.code)): \(err.localizedDescription)"
        }
        loading = false
    }

    func joinHouse() async {
        let code = joinCode.trimmingCharacters(in: .whitespaces)
        guard code.count == 6 else { errorMsg = isHebrew ? "יש להזין קוד בן 6 ספרות" : "Please enter a 6-digit code"; return }
        guard let profile = authVM.profile else { errorMsg = isHebrew ? "פרופיל לא נטען, נסה שוב" : "Profile not loaded, try again"; return }
        loading = true; errorMsg = ""
        let db = Firestore.firestore()
        do {
            let snap = try await db.collection("houses").whereField("code", isEqualTo: code).getDocuments()
            guard let houseDoc = snap.documents.first else {
                errorMsg = isHebrew ? "לא נמצא בית עם קוד זה" : "No home found with that code"; loading = false; return
            }
            let houseId = houseDoc.documentID
            try await houseDoc.reference.collection("joinRequests").document(profile.uid).setData([
                "uid": profile.uid,
                "name": profile.displayName,
                "email": profile.email,
                "requestedAt": FieldValue.serverTimestamp()
            ])
            try await db.collection("users").document(profile.uid).updateData(["pendingHouseId": houseId])
        } catch let err as NSError {
            errorMsg = "Error (\(err.code)): \(err.localizedDescription)"
        }
        loading = false
    }
}
