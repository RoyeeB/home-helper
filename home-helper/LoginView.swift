import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @AppStorage("isHebrew") private var isHebrew = true
    @State private var email = ""
    @State private var password = ""
    @State private var loading = false
    @State private var errorMsg = ""
    @State private var showRegister = false
    @State private var appeared = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBg.ignoresSafeArea()
                VStack(spacing: 0) {
                    // Top hero
                    ZStack {
                        LinearGradient.hero.ignoresSafeArea()
                        VStack(spacing: 12) {
                            Image(systemName: "house.fill")
                                .font(.system(size: 48, weight: .bold))
                                .foregroundColor(.white)
                            Text("Bayit")
                                .font(.system(size: 34, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            Text(isHebrew ? "ניהול הבית שלך" : "Your home, organized")
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.75))
                        }
                        .padding(.vertical, 48)
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 0))

                    ScrollView {
                        VStack(spacing: 20) {
                            VStack(spacing: 14) {
                                StyledTextField(label: isHebrew ? "כתובת מייל" : "Email", placeholder: "you@example.com", text: $email, keyboardType: .emailAddress)
                                StyledTextField(label: isHebrew ? "סיסמה" : "Password", placeholder: "••••••••", text: $password, isSecure: true)
                            }

                            if !errorMsg.isEmpty {
                                HStack(spacing: 8) {
                                    Text(errorMsg).font(.caption).foregroundColor(Color.appDanger)
                                    Spacer()
                                    Image(systemName: "exclamationmark.circle.fill").foregroundColor(Color.appDanger).font(.caption)
                                }
                                .padding(12)
                                .background(Color.appDanger.opacity(0.08))
                                .clipShape(RoundedRectangle(cornerRadius: DS.radiusS))
                            }

                            PrimaryButton(isHebrew ? "התחברות" : "Sign In", loading: loading) { Task { await login() } }

                            Button { showRegister = true } label: {
                                HStack(spacing: 4) {
                                    Text(isHebrew ? "הרשם כאן" : "Sign up").foregroundColor(Color.appPrimary).fontWeight(.semibold)
                                    Text(isHebrew ? "אין לך חשבון?" : "No account?").foregroundColor(Color.appSecondary)
                                }
                                .font(.subheadline)
                            }
                        }
                        .padding(.horizontal, 24)
                        .padding(.top, 28)
                        .padding(.bottom, 40)
                    }
                }
            }
            .navigationDestination(isPresented: $showRegister) {
                RegisterView().environmentObject(authVM)
            }
        }
    }

    func login() async {
        guard !email.isEmpty, !password.isEmpty else {
            errorMsg = isHebrew ? "יש למלא את כל השדות" : "Please fill all fields"; return
        }
        loading = true; errorMsg = ""
        do {
            try await authVM.login(email: email.trimmingCharacters(in: .whitespaces), password: password)
        } catch let err as NSError {
            errorMsg = err.code == 17009 || err.code == 17011
                ? (isHebrew ? "מייל או סיסמה שגויים" : "Incorrect email or password")
                : "Error (\(err.code))"
        }
        loading = false
    }
}
