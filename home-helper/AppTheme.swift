import SwiftUI

// MARK: - Color System
extension Color {
    static let appBg             = Color(hex: "09090E")
    static let appSurface        = Color(hex: "111118")
    static let appCard           = Color(hex: "16161F")
    static let appCardAlt        = Color(hex: "1E1E2A")
    static let appBorder         = Color(hex: "252535")
    static let appPrimary        = Color(hex: "7B73F0")
    static let appPrimaryLight   = Color(hex: "A29CF5")
    static let appSecondary      = Color(hex: "8888A8")
    static let appMuted          = Color(hex: "45455E")
    static let appSuccess        = Color(hex: "1FD4A0")
    static let appDanger         = Color(hex: "F75C5C")
    static let appWarning        = Color(hex: "F5B731")

    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:  (a,r,g,b) = (255,(int>>8)*17,(int>>4 & 0xF)*17,(int & 0xF)*17)
        case 6:  (a,r,g,b) = (255,int>>16,int>>8 & 0xFF,int & 0xFF)
        case 8:  (a,r,g,b) = (int>>24,int>>16 & 0xFF,int>>8 & 0xFF,int & 0xFF)
        default: (a,r,g,b) = (255,200,200,200)
        }
        self.init(.sRGB, red: Double(r)/255, green: Double(g)/255, blue: Double(b)/255, opacity: Double(a)/255)
    }
}

// MARK: - Gradients
extension LinearGradient {
    static let primary = LinearGradient(colors: [Color(hex: "7B73F0"), Color(hex: "5E56D4")],
                                        startPoint: .topLeading, endPoint: .bottomTrailing)
    static let hero = LinearGradient(colors: [Color(hex: "6A62E8"), Color(hex: "3D37B0")],
                                     startPoint: .topLeading, endPoint: .bottomTrailing)
    static let success = LinearGradient(colors: [Color(hex: "1FD4A0"), Color(hex: "0EA880")],
                                        startPoint: .leading, endPoint: .trailing)
    static let danger = LinearGradient(colors: [Color(hex: "F75C5C"), Color(hex: "D43F3F")],
                                       startPoint: .leading, endPoint: .trailing)
}

// MARK: - Category data
let categoryColors: [String: Color] = [
    "food":          Color(hex: "1FD4A0"),
    "transport":     Color(hex: "22C2EE"),
    "entertainment": Color(hex: "A78BFA"),
    "health":        Color(hex: "F87171"),
    "clothing":      Color(hex: "FBBF24"),
    "home":          Color(hex: "7B73F0"),
    "other":         Color(hex: "8888A8")
]
let categoryLabels: [String: String] = [
    "food":"אוכל","transport":"תחבורה","entertainment":"בידור",
    "health":"בריאות","clothing":"לבוש","home":"בית","other":"אחר"
]
let categoryLabelsEn: [String: String] = [
    "food":"Food","transport":"Transport","entertainment":"Entertainment",
    "health":"Health","clothing":"Clothing","home":"Home","other":"Other"
]
let categoryIcons: [String: String] = [
    "food":          "basket.fill",
    "transport":     "car.fill",
    "entertainment": "film.fill",
    "health":        "heart.fill",
    "clothing":      "hanger",
    "home":          "house.fill",
    "other":         "tag.fill"
]
let fixedCostTypes: [(key: String, label: String, icon: String)] = [
    ("rent","שכר דירה","house.fill"),("mortgage","משכנתא","building.columns.fill"),
    ("electricity","חשמל","bolt.fill"),("water","מים","drop.fill"),
    ("internet","אינטרנט","wifi"),("gas","גז","flame.fill"),
    ("insurance","ביטוח","shield.fill"),("other","אחר","ellipsis.circle.fill")
]
let fixedCostLabelsEn: [String: String] = [
    "rent":"Rent","mortgage":"Mortgage","electricity":"Electricity",
    "water":"Water","internet":"Internet","gas":"Gas",
    "insurance":"Insurance","other":"Other"
]
let shoppingCategoryLabelsEn: [String: String] = [
    "שתייה":"Drinks","מוצרי חלב":"Dairy","פירות וירקות":"Produce",
    "מוצרי ניקוי":"Cleaning","חד פעמי":"Disposables","ביצים":"Eggs",
    "לחם ומאפים":"Bakery","בשר ועוף":"Meat & Poultry","דגים":"Fish & Seafood",
    "קטניות ודגנים":"Grains & Legumes","שמנים וממרחים":"Oils & Spreads",
    "חטיפים וממתקים":"Snacks & Sweets","טיפוח":"Personal Care","אחר":"Other"
]
let categories = ["food","transport","entertainment","health","clothing","home","other"]

// MARK: - Formatters
func shekelFormat(_ amount: Double) -> String { "₪\(Int(amount).formatted())" }

func currentMonthKey() -> String {
    let f = DateFormatter(); f.dateFormat = "yyyy-MM"; return f.string(from: Date())
}
func monthKeyLabel(_ key: String) -> String {
    let isHebrew = UserDefaults.standard.object(forKey: "isHebrew") as? Bool ?? true
    let f = DateFormatter(); f.dateFormat = "yyyy-MM"
    guard let date = f.date(from: key) else { return key }
    let out = DateFormatter()
    out.dateFormat = "MMMM yyyy"
    out.locale = Locale(identifier: isHebrew ? "he_IL" : "en_US")
    return out.string(from: date)
}
func last12Months() -> [String] {
    let f = DateFormatter(); f.dateFormat = "yyyy-MM"
    return (0..<12).map { f.string(from: Calendar.current.date(byAdding: .month, value: -$0, to: Date())!) }
}
func last6MonthsOrdered() -> [String] {
    let f = DateFormatter(); f.dateFormat = "yyyy-MM"
    return (0..<6).reversed().map { f.string(from: Calendar.current.date(byAdding: .month, value: -$0, to: Date())!) }
}

// MARK: - Design tokens
enum DS {
    static let radiusS:  CGFloat = 10
    static let radiusM:  CGFloat = 16
    static let radiusL:  CGFloat = 20
    static let radiusXL: CGFloat = 28
    static let paddingS: CGFloat = 12
    static let paddingM: CGFloat = 16
    static let paddingL: CGFloat = 20
}

// MARK: - Card
struct CardView<Content: View>: View {
    var padding: CGFloat = DS.paddingM
    let content: Content
    init(padding: CGFloat = DS.paddingM, @ViewBuilder content: () -> Content) {
        self.padding = padding; self.content = content()
    }
    var body: some View {
        content
            .padding(padding)
            .background(Color.appCard)
            .clipShape(RoundedRectangle(cornerRadius: DS.radiusM))
            .overlay(RoundedRectangle(cornerRadius: DS.radiusM).stroke(Color.appBorder, lineWidth: 1))
    }
}

// MARK: - Gradient card
struct GradientCard<Content: View>: View {
    var gradient: LinearGradient = .hero
    var padding: CGFloat = DS.paddingL
    let content: Content
    init(gradient: LinearGradient = .hero, padding: CGFloat = DS.paddingL,
         @ViewBuilder content: () -> Content) {
        self.gradient = gradient; self.padding = padding; self.content = content()
    }
    var body: some View {
        content
            .padding(padding)
            .background(gradient)
            .clipShape(RoundedRectangle(cornerRadius: DS.radiusXL))
            .shadow(color: Color(hex: "7B73F0").opacity(0.35), radius: 24, x: 0, y: 8)
    }
}

// MARK: - Primary button
struct PrimaryButton: View {
    let title: String
    var loading = false
    var gradient: LinearGradient = .primary
    let action: () -> Void

    init(_ title: String, loading: Bool = false, gradient: LinearGradient = .primary, action: @escaping () -> Void) {
        self.title = title; self.loading = loading; self.gradient = gradient; self.action = action
    }
    var body: some View {
        Button(action: action) {
            ZStack {
                if loading { ProgressView().tint(.white) }
                else { Text(title).fontWeight(.semibold).font(.body) }
            }
            .frame(maxWidth: .infinity).frame(height: 52)
            .background(gradient)
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: DS.radiusM))
            .shadow(color: Color(hex: "7B73F0").opacity(0.35), radius: 12, x: 0, y: 4)
        }
        .buttonStyle(PressScaleStyle())
        .disabled(loading)
    }
}

// MARK: - Quick action
struct QuickActionButton: View {
    let icon: String; let label: String; let action: () -> Void
    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: icon).font(.system(size: 18, weight: .semibold))
                Text(label).font(.caption).fontWeight(.medium)
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity).padding(.vertical, 14)
            .background(.white.opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: DS.radiusM))
        }
        .buttonStyle(PressScaleStyle())
    }
}

// MARK: - Text field
struct StyledTextField: View {
    let label: String; let placeholder: String
    @Binding var text: String
    var isSecure = false
    var keyboardType: UIKeyboardType = .default
    @FocusState private var focused: Bool
    @AppStorage("isHebrew") private var isHebrew = true

    var body: some View {
        VStack(alignment: isHebrew ? .trailing : .leading, spacing: 8) {
            Text(label).font(.caption).fontWeight(.medium).foregroundColor(Color.appSecondary)
            Group {
                if isSecure { SecureField(placeholder, text: $text).focused($focused) }
                else { TextField(placeholder, text: $text).keyboardType(keyboardType).focused($focused) }
            }
            .padding(.horizontal, 14).padding(.vertical, 14)
            .background(Color.appCardAlt)
            .clipShape(RoundedRectangle(cornerRadius: DS.radiusS))
            .overlay(RoundedRectangle(cornerRadius: DS.radiusS)
                .stroke(focused ? Color.appPrimary : Color.appBorder, lineWidth: 1))
            .foregroundColor(.white)
            .multilineTextAlignment(isHebrew ? .trailing : .leading)
            .animation(.easeInOut(duration: 0.2), value: focused)
        }
    }
}

// MARK: - Avatar
struct AvatarView: View {
    let name: String
    var size: CGFloat = 38
    private let colors: [Color] = [.appPrimary, Color(hex: "1FD4A0"), Color(hex: "F5B731"),
                                    Color(hex: "F75C5C"), Color(hex: "22C2EE")]
    private var color: Color {
        let idx = abs(name.hashValue) % colors.count; return colors[idx]
    }
    var body: some View {
        ZStack {
            Circle().fill(color.opacity(0.2))
            Circle().stroke(color.opacity(0.5), lineWidth: 1.5)
            Text(String(name.prefix(1)).uppercased())
                .font(.system(size: size * 0.38, weight: .bold))
                .foregroundColor(color)
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Section header
struct SectionLabel: View {
    let title: String
    var action: (() -> Void)? = nil
    var actionLabel = ""
    var body: some View {
        HStack {
            if let action {
                Button(action: action) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus").font(.caption).fontWeight(.bold)
                        Text(actionLabel).font(.caption).fontWeight(.semibold)
                    }
                    .foregroundColor(Color.appPrimary)
                    .padding(.horizontal, 10).padding(.vertical, 5)
                    .background(Color.appPrimary.opacity(0.12))
                    .clipShape(Capsule())
                }
            }
            Spacer()
            Text(title).font(.subheadline).fontWeight(.semibold).foregroundColor(Color.appSecondary)
        }
    }
}

// MARK: - Month chip
struct MonthChip: View {
    let label: String; let selected: Bool; let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.caption).fontWeight(.medium)
                .padding(.horizontal, 14).padding(.vertical, 8)
                .background(selected ? Color.appPrimary : Color.appCard)
                .foregroundColor(selected ? .white : Color.appSecondary)
                .clipShape(Capsule())
                .overlay(Capsule().stroke(selected ? Color.clear : Color.appBorder, lineWidth: 1))
        }
    }
}

// MARK: - Appear modifier
struct AppearModifier: ViewModifier {
    let delay: Double
    @State private var appeared = false
    func body(content: Content) -> some View {
        content
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 14)
            .onAppear {
                withAnimation(.spring(response: 0.5, dampingFraction: 0.8).delay(delay)) {
                    appeared = true
                }
            }
    }
}
extension View {
    func appearAnimation(delay: Double = 0) -> some View {
        modifier(AppearModifier(delay: delay))
    }
}

// MARK: - Press scale modifier
struct PressScaleStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.easeInOut(duration: 0.12), value: configuration.isPressed)
    }
}

// MARK: - Category badge
struct CategoryBadge: View {
    let category: String
    private var color: Color { categoryColors[category] ?? .appSecondary }
    private var icon: String { categoryIcons[category] ?? "circle.fill" }
    var body: some View {
        ZStack {
            Circle().fill(color.opacity(0.15))
            Image(systemName: icon).font(.system(size: 11, weight: .semibold)).foregroundColor(color)
        }
        .frame(width: 34, height: 34)
    }
}
