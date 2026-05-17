<div align="center">

# 🏠 Home Helper

### Shared household finance, beautifully simple.

A cross-platform mobile app that helps roommates, couples, and families **manage money together** — track expenses, monitor budgets, share a shopping list, and visualize spending in real time.

[![Expo](https://img.shields.io/badge/Expo-SDK%2051-000020?style=flat-square&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![iOS](https://img.shields.io/badge/iOS-supported-000?style=flat-square&logo=apple)]()
[![Android](https://img.shields.io/badge/Android-supported-3DDC84?style=flat-square&logo=android)]()

</div>

---

## ✨ Highlights

> **One house, one financial picture.** Every member sees the same expenses, recurring bills, and shopping list — updated live.

| | |
| :---: | :--- |
| 💸 | **Track expenses** by category — food, transport, entertainment, and more |
| 📅 | **Recurring bills** with due-day reminders (rent, electricity, subscriptions…) |
| 🎯 | **Per-category budgets** with progress bars and over-budget warnings |
| 🛒 | **Shared shopping list** — anyone can add, check off, or clear items |
| 📊 | **Beautiful charts** — pie, bar, and stacked monthly breakdowns |
| 👥 | **Multi-user households** with a simple 6-digit invite code |
| 🌐 | **Bilingual** — English & Hebrew (instant switching, persistent) |
| 🌙 | **Dark mode** with a polished indigo / cyan palette |
| ⚡ | **Real-time sync** via Firestore listeners — no refresh needed |

---

## 📚 Table of Contents

- [✨ Highlights](#-highlights)
- [🧰 Tech Stack](#-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📱 Screens — Detailed Walkthrough](#-screens--detailed-walkthrough)
- [🗄️ Data Model (Firestore)](#️-data-model-firestore)
- [🧠 Global State (Contexts)](#-global-state-contexts)
- [🧩 Component Library](#-component-library)
- [🎨 Theming & Design System](#-theming--design-system)
- [🌐 Internationalization (i18n)](#-internationalization-i18n)
- [🪝 Hooks & Utilities](#-hooks--utilities)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [📜 Scripts](#-scripts)
- [🔒 Security Rules](#-security-rules)

---

## 🧰 Tech Stack

| Layer | Tech |
| --- | --- |
| 📦 **Framework** | Expo SDK 51 + React Native 0.74 |
| 💎 **Language** | TypeScript |
| 🧭 **Navigation** | expo-router (file-based, typed routes) |
| 🧠 **State** | React Context API (3 global contexts) |
| 🔥 **Backend** | Firebase — Auth (email/password) + Firestore (real-time) |
| 💾 **Local storage** | `@react-native-async-storage/async-storage` |
| 🎬 **Animations** | `react-native-reanimated` + `react-native-gesture-handler` |
| 📈 **Charts** | `react-native-gifted-charts` |
| 🎯 **Icons** | `@expo/vector-icons` (Ionicons) |
| 📆 **Dates** | `date-fns` |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│  🧭  Expo Router (file-based)                            │
│                                                          │
│   ┌────────────────┐    ┌────────────────────────────┐   │
│   │  🔐 (auth)     │    │  📱 (tabs) + ⚙️ settings   │   │
│   │  login         │    │  🏠 dashboard              │   │
│   │  register      │    │  💸 expenses               │   │
│   │  house-setup   │    │  📅 fixed-costs            │   │
│   └────────────────┘    │  🛒 shopping               │   │
│         │               │  📊 charts                 │   │
│         │               └────────────────────────────┘   │
│         │                          │                     │
│         ▼                          ▼                     │
│   ┌──────────────────────────────────────────────────┐   │
│   │  🧠  Global Contexts                             │   │
│   │  AuthContext  •  HouseContext  •  LanguageCtx    │   │
│   └──────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│   ┌──────────────────────────────────────────────────┐   │
│   │  🔥  Firebase  —  Auth + Firestore (real-time)   │   │
│   └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

> 🚦 **Routing gate:** `app/_layout.tsx` checks auth state & `profile.houseId`.
> - Not signed in → `(auth)/login`
> - Signed in but no house → `(auth)/house-setup`
> - Otherwise → `(tabs)`

> 🔁 **Real-time sync:** `HouseContext` attaches Firestore listeners on mount and tears them down on logout. Every screen reads from context — no per-screen queries.

---

## 📱 Screens — Detailed Walkthrough

### 🔐 Auth (`app/(auth)/`)

#### 🟢 `login.tsx`
- Email + password fields with inline validation
- Calls `AuthContext.login()` → Firebase `signInWithEmailAndPassword`
- Friendly error feedback on invalid credentials

#### 📝 `register.tsx`
- Full name + email + password (min 6 chars)
- Creates Firebase Auth user, writes `users/{uid}` doc
- Routes to `house-setup` after success

#### 🏠 `house-setup.tsx` — three-mode flow
- 🎯 **Pick:** "Create new home" or "Join existing home"
- 🆕 **Create:** name the home → generates a random **6-digit invite code** → writes `houses/{houseId}` with `name`, `code`, `memberIds`, `members`, `createdAt`
- 🤝 **Join:** enter a 6-digit code → query for house → append user to `memberIds` + `members`
- 🚧 Gate: only appears when the user has no `houseId`

---

### 📱 Tabs (`app/(tabs)/`)

#### 🏠 1. Dashboard (`index.tsx`)
At-a-glance view of the household's financial month.

| Section | What it shows |
| --- | --- |
| 👋 Greeting | "Hello, [name]" + settings button |
| 💰 Hero total | Combined spend this month (variable + fixed) |
| 📊 4 stat tiles | Monthly · Variable · Fixed · Avg per expense |
| 👥 Members | Each member with their personal monthly spend |
| ⏰ Upcoming charges | Fixed costs due in the next 7 days ("Today", "Tomorrow", "In N days") |
| 🎯 Budget tracker | Per-category progress bars (amber at 80%, red over) |
| 🕒 Recent | Last 5 expenses + "See all" link |

#### 💸 2. Expenses (`expenses.tsx`)
- 📅 **Month selector** — horizontal scroll, last 12 months
- 🔍 **Search bar** — by description, note, or member name
- 🏷️ **Category chips** — All + 8 category filters
- 📝 **List** — ordered by date desc; tap to edit, long-press to delete
- ➕ **Add modal** — description (required), amount (> 0), category, optional note. Auto-stamps `monthKey`, `userId`, `userName`, server timestamp.
- ✏️ **Edit modal** — preserves original month & author

#### 📅 3. Fixed Costs (`fixed-costs.tsx`)
- 💵 **Totals** — monthly + yearly projection (×12)
- 🧾 **List** — type-specific icon + color, name, amount, "Day N of month"
- ➕ **Add / Edit** — `type` (rent / mortgage / electricity / water / internet / gas / insurance / subscription / other), `amount`, `dayOfMonth` (1–31)
- 🗑️ **Delete** with confirmation
- ♾️ Items are subscription-style — set once, projected automatically

#### 🛒 4. Shopping (`shopping.tsx`)
- 🏷️ **Header badges** — "X pending" + "Y done"
- ➕ **Add row** — name + quantity → stamped with `addedBy` + `addedAt`
- 📋 **Pending list** — tap checkbox to mark done
- ✅ **Completed section** — "Clear" button bulk-deletes checked items

#### 📊 5. Charts (`charts.tsx`)
Visualizations powered by `react-native-gifted-charts`:

| Chart | What it shows |
| --- | --- |
| 🥧 **Pie** | Current month spending by category |
| 📊 **Bar** | Last 6 months trend (variable expenses) |
| 🏗️ **Stacked bar** | Last 6 months with each member's contribution stacked |
| 👤 **Bar** | Current month total per household member |

---

### ⚙️ Settings modal (`app/settings.tsx`)

| Section | What it does |
| --- | --- |
| 👤 **Profile** | Avatar + name + email |
| 🏠 **My home** | House name + invite code + native Share button |
| 👥 **Members** | List of all household members |
| 🎯 **Monthly budget** | 8 category rows — tap to set ₪ amount (0 = remove) |
| 🌐 **Language** | English / Hebrew radio — instant switch, persisted |
| 🚪 **Account** | Sign out (with confirmation) |

---

## 🗄️ Data Model (Firestore)

### 🌳 Top-level collections

#### 👤 `users/{uid}`
```ts
{
  email: string
  displayName: string
  houseId?: string   // set after house create / join
}
```

#### 🏠 `houses/{houseId}`
```ts
{
  name: string
  code: string                                  // 6 digits, used to invite
  memberIds: string[]                           // for security-rule checks
  members: { uid: string; name: string }[]      // parallel array for display
  createdAt: Timestamp
}
```

### 📂 House subcollections

#### 💸 `houses/{houseId}/expenses/{expenseId}`
```ts
{
  userId: string
  userName: string         // cached at write-time
  desc: string
  amount: number
  category: 'food' | 'transport' | 'entertainment' | 'health'
          | 'clothing' | 'home' | 'education' | 'other'
  note?: string
  monthKey: string         // 'yyyy-MM' — fast month filtering
  date: Timestamp          // server timestamp, for sorting
}
```

#### 📅 `houses/{houseId}/fixedCosts/{fixedCostId}`
```ts
{
  name: string             // e.g. "Rent", "Spotify"
  amount: number
  type: 'rent' | 'mortgage' | 'electricity' | 'water' | 'internet'
      | 'gas' | 'insurance' | 'subscription' | 'other'
  dayOfMonth: number       // 1-31, used for due-date display
}
```

#### 🛒 `houses/{houseId}/shopping/{itemId}`
```ts
{
  name: string
  qty: string              // free-text quantity / unit
  checked: boolean
  addedBy: string          // display name
  addedAt: Timestamp
}
```

#### 🎯 `houses/{houseId}/settings/budgets`
A single document — one optional field per category:
```ts
{
  food?: number
  transport?: number
  // ... one optional field per category
}
```
> 💡 Updated with `setDoc(ref, { [category]: amount }, { merge: true })`; removed with `updateDoc(ref, { [category]: deleteField() })`.

---

## 🧠 Global State (Contexts)

All app state lives in three context providers, wired up in `app/_layout.tsx`.

### 🔐 `AuthContext` — `context/AuthContext.tsx`
Subscribes to Firebase `onAuthStateChanged` and auto-loads the `UserProfile`.

| | |
| --- | --- |
| **State** | `user`, `profile`, `loading` |
| **Actions** | `login`, `register`, `logout`, `refreshProfile` |

### 🏠 `HouseContext` — `context/HouseContext.tsx`
Real-time Firestore listeners on the user's house and all subcollections.

| | |
| --- | --- |
| **State** | `house`, `expenses[]`, `fixedCosts[]`, `shoppingItems[]`, `budgets`, `loadingHouse` |
| **💸 Expenses** | `addExpense`, `updateExpense`, `deleteExpense` |
| **📅 Fixed costs** | `addFixedCost`, `updateFixedCost`, `deleteFixedCost` |
| **🛒 Shopping** | `addShoppingItem`, `toggleShoppingItem`, `clearCheckedItems` |
| **🎯 Budgets** | `setBudget`, `removeBudget` |

### 🌐 `LanguageContext` — `context/LanguageContext.tsx`
Loads & persists the user's language preference.

| | |
| --- | --- |
| **State** | `lang` (`'en' \| 'he'`), `ready`, `isRTL` |
| **Actions** | `setLanguage(lang)`, `t(key, vars?)` |

> 📝 Hebrew renders RTL via Unicode bidi — `I18nManager.forceRTL()` is **not** called, so layouts stay LTR.

---

## 🧩 Component Library

Reusable UI primitives in `components/`:

| 🧱 Component | Purpose |
| --- | --- |
| 🔘 `Button.tsx` | Primary / secondary / ghost / danger variants · sm/md/lg sizes · icon + label · loading state |
| 📇 `Card.tsx` | Surface container — variants: default, elevated, flat, outline, inset. Optional pressable |
| 📝 `Input.tsx` | Labeled text input · optional icon · focus/error states · helper text |
| 🎯 `BudgetCard.tsx` | Per-category budget rows with progress bars; amber/red as usage rises |
| ⭕ `IconButton.tsx` | 44px touch target · spring scale animation · subtle/plain/solid/danger |
| 🌫️ `EmptyState.tsx` | Centered icon + title + description + optional action |
| 📑 `SectionHeader.tsx` | Title + hint + optional action — used above dashboard sections |
| 🎬 `AnimatedTabBar.tsx` | Custom bottom tab bar with animated indicator |
| 👆 `AnimatedPressable.tsx` | Pressable with reanimated spring scale on press |
| ✨ `ScreenTransition.tsx` | Wraps screen content in a fade-in animation |

---

## 🎨 Theming & Design System

Defined in `constants/colors.ts` and `constants/theme.ts`.

### 🌈 Colors

<table>
<tr><td>

**Backgrounds** (deepest → highest)
```
bg          #080b14
bgElevated  #0e1120
card        #141828
cardAlt     #1c2236
surface     #242b42
```

</td><td>

**Brand & accent**
```
primary  #818cf8  (indigo)
accent   #22d3ee  (cyan)
```

**Text hierarchy**
```
text          #f0f2ff
textSecondary #9aa0bc
textMuted     #5d6580
textSubtle    #3e4463
```

</td><td>

**Semantic**
```
✅ success  #34d399
❌ danger   #f87171
⚠️  warning #fbbf24
ℹ️  info    #60a5fa
```

</td></tr>
</table>

> 🏷️ Each of the **8 expense categories** has its own color, label, and Ionicon (`CATEGORY_COLORS`, `CATEGORY_LABELS`, `CATEGORY_ICONS`).

### 🔤 Typography (`TYPE` tokens)
`hero` · `display` · `h1` · `h2` · `h3` · `body` · `bodyStrong` · `caption` · `micro` · `overline`

### 📏 Spacing — 4-pt grid
`xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 20 · `2xl` 24 · `3xl` 32 · `4xl` 48

### 🟦 Radius
`xs` 6 · `sm` 10 · `md` 14 · `lg` 20 · `xl` 28 · `2xl` 36 · `pill` 999

### 🌑 Shadows
`xs` · `sm` · `md` · `lg` elevation tiers + a `glow` shadow used on primary buttons

---

## 🌐 Internationalization (i18n)

`lib/i18n.ts` defines a `TRANSLATIONS` map with English & Hebrew strings, grouped into namespaces:

```
common · auth · house · tabs · expenses · categories
charts · settings · shopping · fixed · fixedTypes · dashboard
```

#### 👨‍💻 Usage

```tsx
const { t } = useLanguage();

<Text>{t('expenses.addTitle')}</Text>
<Text>{t('dashboard.greeting', { name: profile.displayName })}</Text>
```

> 💾 The selected language is persisted in AsyncStorage — the next launch picks it up automatically.

---

## 🪝 Hooks & Utilities

### 📅 `hooks/useMonthKey.ts`
| Function | Purpose |
| --- | --- |
| `getCurrentMonthKey()` | Returns `'yyyy-MM'` for today |
| `getMonthLabel(monthKey)` | Returns human-readable month name |
| `getLast12Months()` | Array of last 12 month keys (for the month picker) |
| `getLast6Months()` | Array of last 6 month keys (for chart axes) |

### 🧭 `utils/navDirection.ts`
Helper for animated screen transitions (LTR / RTL direction handling).

---

## 📁 Project Structure

```
📁 app/
   📄 _layout.tsx              # Auth gate + root providers
   📄 index.tsx                # Redirect entry
   📄 settings.tsx             # Settings modal
   📁 (auth)/
      📄 _layout.tsx
      📄 login.tsx
      📄 register.tsx
      📄 house-setup.tsx
   📁 (tabs)/
      📄 _layout.tsx           # AnimatedTabBar wiring
      📄 index.tsx             # 🏠 Dashboard
      📄 expenses.tsx          # 💸
      📄 fixed-costs.tsx       # 📅
      📄 shopping.tsx          # 🛒
      📄 charts.tsx            # 📊

📁 components/                 # Reusable UI primitives
📁 context/                    # AuthContext, HouseContext, LanguageContext
📁 constants/                  # colors.ts, theme.ts
📁 hooks/                      # useMonthKey.ts
📁 lib/                        # firebase.ts, i18n.ts
📁 utils/                      # navDirection.ts
📁 assets/                     # icons, splash, fonts

📄 firestore.rules             # Firestore security rules
📄 app.json                    # Expo config
```

---

## 🚀 Getting Started

### ✅ Prerequisites
- 🟢 **Node.js** 18+
- 📦 **npm**
- 🍏 **Xcode** (iOS) or 🤖 **Android Studio** (Android)
- 🔥 A **Firebase project** with Email/Password auth enabled and Firestore in production mode

### 1️⃣ Install dependencies
```bash
npm install
```

### 2️⃣ Configure Firebase
Edit `lib/firebase.ts` and replace the `firebaseConfig` object with the values from your Firebase Console *(Project Settings → Your apps)*:

```ts
const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
};
```

### 3️⃣ Deploy Firestore rules
Copy `firestore.rules` into your Firebase project's Firestore Rules tab, or deploy via CLI:
```bash
firebase deploy --only firestore:rules
```

### 4️⃣ Run the app
```bash
npm start          # 📱 Expo dev server (scan the QR with Expo Go)
npm run ios        # 🍏 Build and run on iOS simulator
npm run android    # 🤖 Build and run on Android emulator
```

### 5️⃣ First-run flow
1. 📝 Register a new account (name + email + password)
2. 🏠 Choose "Create a new home" → name it → copy the invite code
3. 🤝 *(Optional)* On a second device, register another user, choose "Join", paste the code
4. 💸 Start logging expenses and adding shared shopping items 🎉

---

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm start` | 🚀 Start the Expo development server |
| `npm run ios` | 🍏 Build and launch on the iOS simulator |
| `npm run android` | 🤖 Build and launch on the Android emulator |

---

## 🔒 Security Rules

`firestore.rules` enforces:

- 👤 **`users/{uid}`** — readable / writable only by that user
- 🏠 **`houses/{houseId}`** and all subcollections — readable / writable only by users whose UID is in the house's `memberIds` array
- 🛡️ House membership is checked on every house-scoped read/write — no cross-house data leakage

---

<div align="center">

### 📄 License

Private project — built with ❤️ by [@RoyeeB](https://github.com/RoyeeB)

</div>
