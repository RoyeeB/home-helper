import Foundation
import FirebaseAuth
import FirebaseFirestore

@MainActor
class AuthViewModel: ObservableObject {
    @Published var user: User?
    @Published var profile: UserProfile?
    @Published var isLoading = true

    private var authHandle: AuthStateDidChangeListenerHandle?
    private var profileListener: ListenerRegistration?

    init() {
        authHandle = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor [weak self] in
                guard let self else { return }
                self.user = user
                if let user {
                    self.startProfileListener(uid: user.uid)
                } else {
                    self.profileListener?.remove()
                    self.profileListener = nil
                    self.profile = nil
                    self.isLoading = false
                }
            }
        }
    }

    deinit {
        if let h = authHandle { Auth.auth().removeStateDidChangeListener(h) }
        profileListener?.remove()
    }

    private func startProfileListener(uid: String) {
        profileListener?.remove()
        let db = Firestore.firestore()
        profileListener = db.collection("users").document(uid)
            .addSnapshotListener { [weak self] snap, _ in
                guard let self else { return }
                Task { @MainActor in
                    if let snap, snap.exists, let p = try? snap.data(as: UserProfile.self) {
                        self.profile = p
                    } else if self.profile == nil {
                        await self.createMissingProfile(uid: uid)
                    }
                    self.isLoading = false
                }
            }
    }

    private func createMissingProfile(uid: String) async {
        let firebaseUser = Auth.auth().currentUser
        let p = UserProfile(uid: uid,
                            email: firebaseUser?.email ?? "",
                            displayName: firebaseUser?.displayName ?? firebaseUser?.email ?? "משתמש")
        try? Firestore.firestore().collection("users").document(uid).setData(from: p)
        profile = p
    }

    func login(email: String, password: String) async throws {
        try await Auth.auth().signIn(withEmail: email, password: password)
    }

    func register(email: String, password: String, name: String) async throws {
        let result = try await Auth.auth().createUser(withEmail: email, password: password)
        let change = result.user.createProfileChangeRequest()
        change.displayName = name
        try await change.commitChanges()

        let p = UserProfile(uid: result.user.uid, email: email, displayName: name)
        try Firestore.firestore().collection("users").document(result.user.uid).setData(from: p)
        profile = p
    }

    func logout() throws {
        try Auth.auth().signOut()
    }

    func refreshProfile() async {
        // Profile updates automatically via real-time listener
    }
}
