import SwiftUI

struct RegisterView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @Environment(\.dismiss) var dismiss
    @AppStorage("isHebrew") private var isHebrew = true
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var loading = false
    @State private var errorMsg = ""

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 32) {
                    Spacer(minLength: 20)

                    VStack(spacing: 8) {
                        Text(isHebrew ? "יצירת חשבון" : "Create Account")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)
                        Text(isHebrew ? "הצטרף ל-Bayit" : "Join Bayit")
                            .foregroundColor(Color.appSecondary)
                    }

                    VStack(spacing: 16) {
                        StyledTextField(label: isHebrew ? "שם מלא" : "Full Name", placeholder: isHebrew ? "ישראל ישראלי" : "John Smith", text: $name)
                        StyledTextField(label: isHebrew ? "כתובת מייל" : "Email", placeholder: "you@example.com", text: $email, keyboardType: .emailAddress)
                        StyledTextField(label: isHebrew ? "סיסמה" : "Password", placeholder: isHebrew ? "לפחות 6 תווים" : "At least 6 characters", text: $password, isSecure: true)

                        if !errorMsg.isEmpty {
                            Text(errorMsg)
                                .font(.caption)
                                .foregroundColor(Color.appDanger)
                                .frame(maxWidth: .infinity, alignment: isHebrew ? .trailing : .leading)
                        }

                        PrimaryButton(isHebrew ? "הרשמה" : "Sign Up", loading: loading) {
                            Task { await register() }
                        }
                    }

                    Button(isHebrew ? "כבר יש לך חשבון? התחבר" : "Already have an account? Sign in") { dismiss() }
                        .font(.subheadline)
                        .foregroundColor(Color.appSecondary)
                }
                .padding(.horizontal, 24)
            }
        }
        .navigationBarBackButtonHidden(false)
        .environment(\.layoutDirection, isHebrew ? .rightToLeft : .leftToRight)
    }

    func register() async {
        guard !name.isEmpty, !email.isEmpty, !password.isEmpty else {
            errorMsg = isHebrew ? "יש למלא את כל השדות" : "Please fill in all fields"; return
        }
        guard password.count >= 6 else {
            errorMsg = isHebrew ? "הסיסמה חייבת להכיל לפחות 6 תווים" : "Password must be at least 6 characters"; return
        }
        loading = true; errorMsg = ""
        do {
            try await authVM.register(
                email: email.trimmingCharacters(in: .whitespaces),
                password: password,
                name: name.trimmingCharacters(in: .whitespaces)
            )
        } catch let err as NSError {
            if err.code == 17007 {
                errorMsg = isHebrew ? "כתובת המייל כבר קיימת במערכת" : "Email already in use"
            } else if err.code == 17026 {
                errorMsg = isHebrew ? "הסיסמה חלשה מדי" : "Password is too weak"
            } else if err.code == 17008 {
                errorMsg = isHebrew ? "כתובת המייל אינה תקינה" : "Invalid email address"
            } else if err.code == 17999 || err.code == 17020 {
                errorMsg = isHebrew ? "בעיית רשת – נסה שוב" : "Network error – try again"
            } else {
                errorMsg = "Error (\(err.code)): \(err.localizedDescription)"
            }
        }
        loading = false
    }
}
