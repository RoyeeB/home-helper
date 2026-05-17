import SwiftUI

struct HouseInfoSheet: View {
    @EnvironmentObject var houseVM: HouseViewModel
    @Environment(\.dismiss) var dismiss
    @AppStorage("isHebrew") private var isHebrew = true
    @State private var copied = false

    var body: some View {
        ZStack { Color.appBg.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 24) {

                    // Header
                    HStack {
                        Spacer()
                        Button { dismiss() } label: {
                            Image(systemName: "xmark.circle.fill")
                                .font(.title2)
                                .foregroundColor(Color.appSecondary)
                        }
                    }

                    Text(houseVM.house?.name ?? "")
                        .font(.system(size: 26, weight: .bold))
                        .foregroundColor(.white)

                    // Code card
                    VStack(spacing: 12) {
                        Text(isHebrew ? "קוד הצטרפות" : "Join Code")
                            .font(.caption)
                            .foregroundColor(Color.appSecondary)

                        Text(houseVM.house?.code ?? "")
                            .font(.system(size: 40, weight: .bold, design: .monospaced))
                            .kerning(8)
                            .foregroundColor(Color.appPrimary)

                        Button {
                            UIPasteboard.general.string = houseVM.house?.code
                            copied = true
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) { copied = false }
                        } label: {
                            HStack(spacing: 6) {
                                Image(systemName: copied ? "checkmark" : "doc.on.doc")
                                Text(copied ? (isHebrew ? "הועתק!" : "Copied!") : (isHebrew ? "העתק קוד" : "Copy Code"))
                            }
                            .font(.subheadline.weight(.medium))
                            .foregroundColor(copied ? Color.appSuccess : Color.appPrimary)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(Color.appCard)
                            .cornerRadius(12)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(24)
                    .background(Color.appCard)
                    .cornerRadius(16)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.appPrimary.opacity(0.4), lineWidth: 1))

                    // Members list
                    VStack(alignment: .trailing, spacing: 12) {
                        Text(isHebrew ? "בני הבית" : "Members")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, alignment: isHebrew ? .trailing : .leading)

                        ForEach(houseVM.house?.members ?? [], id: \.uid) { m in
                            HStack(spacing: 12) {
                                Spacer()
                                Text(m.name).font(.subheadline).foregroundColor(.white)
                                AvatarView(name: m.name)
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(Color.appCard)
                            .cornerRadius(12)
                        }
                    }

                    // Language toggle
                    VStack(alignment: .trailing, spacing: 12) {
                        Text(isHebrew ? "הגדרות" : "Settings")
                            .font(.headline).foregroundColor(.white)
                            .frame(maxWidth: .infinity, alignment: isHebrew ? .trailing : .leading)

                        HStack(spacing: 14) {
                            Toggle("", isOn: Binding(
                                get: { !isHebrew },
                                set: { isHebrew = !$0 }
                            ))
                            .labelsHidden()
                            .tint(Color.appPrimary)

                            Spacer()

                            VStack(alignment: .trailing, spacing: 2) {
                                Text(isHebrew ? "שפה" : "Language")
                                    .font(.subheadline.weight(.medium)).foregroundColor(.white)
                                Text(isHebrew ? "עברית / English" : "Hebrew / English")
                                    .font(.caption).foregroundColor(Color.appSecondary)
                            }
                            Image(systemName: "globe")
                                .font(.title3)
                                .foregroundColor(Color.appPrimary)
                        }
                        .padding(14)
                        .background(Color.appCard)
                        .cornerRadius(14)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.appBorder, lineWidth: 1))
                    }

                    // Pending join requests
                    if !houseVM.joinRequests.isEmpty {
                        VStack(alignment: .trailing, spacing: 12) {
                            HStack {
                                Circle().fill(Color.appWarning).frame(width: 8, height: 8)
                                Text(isHebrew ? "\(houseVM.joinRequests.count) ממתינים לאישור" : "\(houseVM.joinRequests.count) pending")
                                    .font(.caption)
                                    .foregroundColor(Color.appWarning)
                                Spacer()
                                Text(isHebrew ? "בקשות הצטרפות" : "Join Requests")
                                    .font(.headline)
                                    .foregroundColor(.white)
                            }

                            ForEach(houseVM.joinRequests) { req in
                                RequestRow(request: req)
                            }
                        }
                    }

                    Spacer(minLength: 40)
                }
                .padding(20)
            }
        }
    }
}

struct RequestRow: View {
    @EnvironmentObject var houseVM: HouseViewModel
    @AppStorage("isHebrew") private var isHebrew = true
    let request: JoinRequest
    @State private var approving = false
    @State private var denying = false

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                Spacer()
                VStack(alignment: .trailing, spacing: 3) {
                    Text(request.name)
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(.white)
                    Text(request.email)
                        .font(.caption)
                        .foregroundColor(Color.appSecondary)
                }
                AvatarView(name: request.name)
            }

            HStack(spacing: 10) {
                // Deny
                Button {
                    Task {
                        denying = true
                        try? await houseVM.denyRequest(request)
                        denying = false
                    }
                } label: {
                    HStack(spacing: 4) {
                        if denying { ProgressView().scaleEffect(0.7).tint(.white) }
                        else { Image(systemName: "xmark") }
                        Text(isHebrew ? "דחייה" : "Deny")
                    }
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(Color.appDanger)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color.appDanger.opacity(0.15))
                    .cornerRadius(10)
                }
                .disabled(approving || denying)

                // Approve
                Button {
                    Task {
                        approving = true
                        try? await houseVM.approveRequest(request)
                        approving = false
                    }
                } label: {
                    HStack(spacing: 4) {
                        if approving { ProgressView().scaleEffect(0.7).tint(.white) }
                        else { Image(systemName: "checkmark") }
                        Text(isHebrew ? "אישור" : "Approve")
                    }
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color.appPrimary)
                    .cornerRadius(10)
                }
                .disabled(approving || denying)
            }
        }
        .padding(14)
        .background(Color.appCard)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.appWarning.opacity(0.4), lineWidth: 1))
    }
}
