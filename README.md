# Home Helper

A React Native (Expo) mobile app for **shared household finance management**. Multiple users can join the same "house," then collaboratively log expenses, manage recurring bills, share a shopping list, and visualize spending — all synced in real time via Firebase.

Bilingual (English / Hebrew), dark-themed, and optimized for iOS and Android.

---

## Table of Contents

1. [What the App Does](#what-the-app-does)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Screens — Detailed Walkthrough](#screens--detailed-walkthrough)
5. [Data Model (Firestore)](#data-model-firestore)
6. [Global State (Contexts)](#global-state-contexts)
7. [Component Library](#component-library)
8. [Theming & Design System](#theming--design-system)
9. [Internationalization (i18n)](#internationalization-i18n)
10. [Hooks & Utilities](#hooks--utilities)
11. [Project Structure](#project-structure)
12. [Getting Started](#getting-started)
13. [Scripts](#scripts)
14. [Security Rules](#security-rules)

---

## What the App Does

Home Helper is built for households (roommates, couples, families) who want to **share the financial picture** of running a home. The core idea: every member sees the same expenses, the same recurring bills, and the same shopping list, in real time.

### Core capabilities

- **Track variable expenses** — log purchases (food, transport, entertainment, etc.) with amount, category, description, optional note. Every entry remembers who recorded it.
- **Manage fixed costs** — recurring monthly bills (rent, electricity, internet, subscriptions...) with a "day of month" charge date.
- **Set monthly budgets** — per-category budgets with progress bars and over-budget warnings.
- **Shared shopping list** — anyone in the house can add items, mark them done, and clear completed items.
- **Visualize spending** — pie chart by category, monthly trend bars, per-member breakdown, stacked monthly view.
- **Multi-user households** — create a house, get a 6-digit invite code, share it; new members instantly see all data.
- **Bilingual UI** — switch between English and Hebrew at any time (persisted across launches).
- **Dark mode** with a custom indigo/cyan accent palette.

---

## Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | **Expo SDK 51** + **React Native 0.74** |
| Language | **TypeScript** |
| Navigation | **expo-router** (file-based, typed routes) |
| State | **React Context API** (3 global contexts) |
| Backend | **Firebase** — Auth (email/password) + Firestore (real-time listeners) |
| Local storage | `@react-native-async-storage/async-storage` (auth persistence + language pref) |
| Animations | `react-native-reanimated` + `react-native-gesture-handler` |
| Charts | `react-native-gifted-charts` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Dates | `date-fns` |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Expo Router (file-based)                                │
│  ┌────────────────┐    ┌────────────────────────────┐    │
│  │  (auth) group  │    │  (tabs) group + settings   │    │
│  │  login         │    │  index (dashboard)         │    │
│  │  register      │    │  expenses                  │    │
│  │  house-setup   │    │  fixed-costs               │    │
│  └────────────────┘    │  shopping                  │    │
│         │              │  charts                    │    │
│         │              │  settings (modal)          │    │
│         │              └────────────────────────────┘    │
│         │                          │                     │
│         ▼                          ▼                     │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Global Contexts                                 │    │
│  │  AuthContext  HouseContext  LanguageContext      │    │
│  └──────────────────────────────────────────────────┘    │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Firebase (Auth + Firestore real-time)           │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

- **Routing gate:** `app/_layout.tsx` checks Auth state and `profile.houseId`. Unauthenticated → `(auth)/login`. Authenticated but no house → `(auth)/house-setup`. Otherwise → `(tabs)`.
- **Real-time sync:** `HouseContext` attaches Firestore listeners on mount and tears them down on logout/house change. Every screen reads from context — no per-screen queries.

---

## Screens — Detailed Walkthrough

### Auth screens (`app/(auth)/`)

#### 1. `login.tsx`
- Email + password fields with validation.
- Calls `AuthContext.login()` → Firebase `signInWithEmailAndPassword`.
- Error feedback on invalid credentials.
- Link to register screen.

#### 2. `register.tsx`
- Full name, email, password (min 6 chars).
- Creates user in Firebase Auth, then writes `users/{uid}` doc (`email`, `displayName`).
- Routes to `house-setup` after success.

#### 3. `house-setup.tsx` — three-mode flow
- **Pick mode:** "Create new home" or "Join existing home".
- **Create mode:**
  - Enter home name, generates a random **6-digit code**.
  - Writes `houses/{houseId}` with `name`, `code`, `memberIds: [uid]`, `members: [{ uid, name }]`, `createdAt`.
  - Patches `users/{uid}` with the new `houseId`.
  - Shows success screen with the shareable code for 2.5s before redirecting.
- **Join mode:**
  - Enter a 6-digit code.
  - Queries `houses` for a matching code; if found, appends current user to `memberIds` and `members`, sets the user's `houseId`.
- Gate: this screen only appears if the authenticated user has no `houseId`.

### Tab screens (`app/(tabs)/`)

#### 1. Dashboard (`index.tsx`)
The home screen — at-a-glance view of the household's financial month.
- **Greeting header** ("Hello, [name]") + settings button.
- **Hero total** — combined spend this month (variable + fixed), split into the two components.
- **4 stat tiles** — Monthly total, Variable (this month), Fixed (recurring), Average per expense.
- **Members list** — all household members with their personal spend this month.
- **Upcoming charges** — fixed costs due in the next 7 days (uses `daysUntil(dayOfMonth)` logic), labeled "Today", "Tomorrow", "In N days".
- **Budget tracker** — `BudgetCard` showing each tracked category with progress bar; warning when ≥ 80%, danger when over.
- **Recent expenses** — last 5 entries from the current month, with a "See all" link.

#### 2. Expenses (`expenses.tsx`)
The detailed expense log + add/edit interface.
- **Month selector** — horizontal scroll of the last 12 months; filters by `monthKey` (`yyyy-MM`).
- **Search bar** — filters by description, note, or member name.
- **Category chips** — "All" + 8 category filters.
- **List** — ordered by date desc; each row shows category icon, description, amount, member name, timestamp.
- **Tap to edit / long-press to delete** (with confirmation alert).
- **Add modal** — fields: description (required), amount (must be > 0), category (picker), optional note. On save: stamps `monthKey`, `userId`, `userName`, `date` (server timestamp).
- **Edit modal** — updates description / amount / category / note; preserves the original month and author.

#### 3. Fixed Costs (`fixed-costs.tsx`)
Recurring monthly bills.
- **Totals** — monthly total + yearly projection (×12).
- **List** — each item shows type-specific icon and color, name, amount, "Day N of month".
- **Add / Edit modal** — `type` (rent, mortgage, electricity, water, internet, gas, insurance, subscription, other), `amount`, `dayOfMonth` (1–31, validated).
- **Delete** with confirmation.
- Items are subscription-style: they do not need to be re-entered each month; the dashboard projects them automatically.

#### 4. Shopping (`shopping.tsx`)
Shared shopping list.
- **Header counts** — "X pending" + "Y done" badges.
- **Add row** — name + quantity inputs; new items default to `checked: false`, stamped with `addedBy` (the user's name) and `addedAt`.
- **Pending list** — animated rows; tap the checkbox to mark done (writes `checked: true`).
- **Completed section** — shows checked items; **"Clear"** button bulk-deletes everything that's checked.

#### 5. Charts (`charts.tsx`)
Spending visualizations powered by `react-native-gifted-charts`.
- **By category (pie chart)** — current month variable expenses, one slice per non-zero category.
- **Monthly trend (bar chart)** — last 6 months of variable expenses; active month highlighted.
- **Monthly breakdown (stacked bar)** — last 6 months with each member's contribution stacked.
- **By member (bar chart)** — current month total per household member.
- Empty state if there are no expenses in the lookback window.

### Settings modal (`app/settings.tsx`)

Presented as a modal from any tab.
- **Profile card** — avatar (initial), name, email.
- **My home** — house name + invite code; "Share" button opens the native share sheet pre-filled with the code.
- **House members** — list of all members.
- **Monthly budget** — 8 category rows. Tap a row → modal to set a ₪ amount (or 0 to remove). Writes to `houses/{houseId}/settings/budgets` as a partial merge; removals use `deleteField()`.
- **Language** — English / Hebrew radio; switching is immediate (no restart) and persists to AsyncStorage.
- **Account** — Sign out (with confirmation alert).

---

## Data Model (Firestore)

### Top-level collections

#### `users/{uid}`
```ts
{
  email: string
  displayName: string
  houseId?: string   // set after house create/join
}
```

#### `houses/{houseId}`
```ts
{
  name: string
  code: string                          // 6 digits, used to invite
  memberIds: string[]                   // for security-rule membership checks
  members: { uid: string; name: string }[]   // parallel array for display
  createdAt: Timestamp
}
```

### House subcollections

#### `houses/{houseId}/expenses/{expenseId}`
```ts
{
  userId: string
  userName: string         // cached at write-time
  desc: string
  amount: number
  category: 'food' | 'transport' | 'entertainment' | 'health'
          | 'clothing' | 'home' | 'education' | 'other'
  note?: string
  monthKey: string         // 'yyyy-MM' — used for fast month filtering
  date: Timestamp          // server timestamp, used for sorting
}
```

#### `houses/{houseId}/fixedCosts/{fixedCostId}`
```ts
{
  name: string             // e.g. "Rent", "Spotify"
  amount: number
  type: 'rent' | 'mortgage' | 'electricity' | 'water' | 'internet'
      | 'gas' | 'insurance' | 'subscription' | 'other'
  dayOfMonth: number       // 1-31, used for due-date display
}
```

#### `houses/{houseId}/shopping/{itemId}`
```ts
{
  name: string
  qty: string              // free-text quantity/unit
  checked: boolean
  addedBy: string          // display name
  addedAt: Timestamp
}
```

#### `houses/{houseId}/settings/budgets`
A single document holding per-category limits:
```ts
{
  food?: number
  transport?: number
  // ... one optional field per category
}
```
Updated with `setDoc(ref, { [category]: amount }, { merge: true })`; removed with `updateDoc(ref, { [category]: deleteField() })`.

---

## Global State (Contexts)

All app state is exposed via three context providers, wired up in `app/_layout.tsx`.

### `AuthContext` (`context/AuthContext.tsx`)
Subscribes to Firebase `onAuthStateChanged` and auto-loads the `UserProfile`.
- **State:** `user` (Firebase User), `profile` (UserProfile), `loading`.
- **Actions:** `login(email, password)`, `register(email, password, name)`, `logout()`, `refreshProfile()` (re-reads after house setup).

### `HouseContext` (`context/HouseContext.tsx`)
Attaches real-time Firestore listeners on the user's house and all its subcollections. Tears them down when `profile.houseId` changes.
- **State:** `house`, `expenses[]`, `fixedCosts[]`, `shoppingItems[]`, `budgets`, `loadingHouse`.
- **Expense actions:** `addExpense(input)`, `updateExpense(id, input)`, `deleteExpense(id)`.
- **Fixed-cost actions:** `addFixedCost(input)`, `updateFixedCost(id, input)`, `deleteFixedCost(id)`.
- **Shopping actions:** `addShoppingItem(name, qty)`, `toggleShoppingItem(id, checked)`, `clearCheckedItems()`.
- **Budget actions:** `setBudget(category, amount)`, `removeBudget(category)`.

### `LanguageContext` (`context/LanguageContext.tsx`)
- Loads the user's language preference from AsyncStorage on mount.
- **State:** `lang` (`'en' | 'he'`), `ready`, `isRTL`.
- **Actions:** `setLanguage(lang)`, `t(key, vars?)` — translation lookup with variable interpolation.
- Hebrew renders RTL via Unicode bidi, without calling `I18nManager.forceRTL()` (so layouts stay LTR).

---

## Component Library (`components/`)

| Component | Purpose |
| --- | --- |
| `Button.tsx` | Primary / secondary / ghost / danger variants, sm/md/lg sizes, icon + label, loading state. |
| `Card.tsx` | Surface container — variants: default, elevated, flat, outline, inset. Optional pressable. |
| `Input.tsx` | Labeled text input with optional icon, focused/error states, helper text. |
| `BudgetCard.tsx` | Renders per-category budget rows with progress bars; color shifts to amber/red as usage rises. |
| `IconButton.tsx` | 44px-touch-target icon button with spring scale animation. Variants: subtle, plain, solid, danger. |
| `EmptyState.tsx` | Centered icon + title + description + optional action, for empty lists. |
| `SectionHeader.tsx` | Title + hint + optional action — used above each dashboard section. |
| `AnimatedTabBar.tsx` | Custom bottom tab bar with animated indicator. Used by `(tabs)/_layout.tsx`. |
| `AnimatedPressable.tsx` | Pressable with reanimated spring scale on press, for list rows. |
| `ScreenTransition.tsx` | Wraps screen content in a fade-in animation. |

---

## Theming & Design System

Defined in `constants/colors.ts` and `constants/theme.ts`.

### Colors

- **Backgrounds:** `bg`, `bgElevated`, `card`, `cardAlt`, `surface` — layered from deepest to highest.
- **Brand:** `primary` (#818cf8 indigo), `accent` (#22d3ee cyan).
- **Text:** `text`, `textSecondary`, `textMuted`, `textSubtle`.
- **Semantic:** `success`, `danger`, `warning`, `info`.
- **Categories:** each of the 8 expense categories has its own color, label, and Ionicon (`CATEGORY_COLORS`, `CATEGORY_LABELS`, `CATEGORY_ICONS`).

### Typography
Tokens in `TYPE`: `hero`, `display`, `h1`, `h2`, `h3`, `body`, `bodyStrong`, `caption`, `micro`, `overline`.

### Spacing
4-pt grid: `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 20 · `2xl` 24 · `3xl` 32 · `4xl` 48.

### Radius
`xs` 6 · `sm` 10 · `md` 14 · `lg` 20 · `xl` 28 · `2xl` 36 · `pill` 999.

### Shadows
`xs`, `sm`, `md`, `lg` elevation tiers + a `glow` shadow used on primary buttons.

---

## Internationalization (i18n)

`lib/i18n.ts` defines a `TRANSLATIONS` map with English and Hebrew strings, grouped into sections:

- `common` — Cancel, Save, Delete, Edit, Loading, Total, Add, etc.
- `auth` — login/register field labels and errors.
- `house` — setup flow strings, invite code messaging.
- `tabs` — tab names.
- `expenses`, `categories`, `charts`, `settings`, `shopping`, `fixed`, `fixedTypes`, `dashboard` — section-specific strings.

Use it like:
```tsx
const { t } = useLanguage();
<Text>{t('expenses.addTitle')}</Text>
<Text>{t('dashboard.greeting', { name: profile.displayName })}</Text>
```

The selected language is persisted in AsyncStorage; the next launch picks it up automatically.

---

## Hooks & Utilities

### `hooks/useMonthKey.ts`
- `getCurrentMonthKey()` → `'yyyy-MM'` for today.
- `getMonthLabel(monthKey)` → human-readable month name.
- `getLast12Months()` / `getLast6Months()` → arrays of month keys for the month picker and chart axes.

### `utils/navDirection.ts`
Helper for animated screen transitions (LTR/RTL direction handling).

---

## Project Structure

```
app/
  _layout.tsx              # Auth gate + root providers
  index.tsx                # Redirect entry
  settings.tsx             # Settings modal
  (auth)/
    _layout.tsx
    login.tsx
    register.tsx
    house-setup.tsx
  (tabs)/
    _layout.tsx            # AnimatedTabBar wiring
    index.tsx              # Dashboard
    expenses.tsx
    fixed-costs.tsx
    shopping.tsx
    charts.tsx

components/                # Reusable UI primitives
context/                   # AuthContext, HouseContext, LanguageContext
constants/                 # colors.ts, theme.ts
hooks/                     # useMonthKey.ts
lib/                       # firebase.ts, i18n.ts
utils/                     # navDirection.ts
assets/                    # icons, splash, fonts

firestore.rules            # Firestore security rules
app.json                   # Expo config
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Xcode (for iOS) or Android Studio (for Android)
- A Firebase project with **Email/Password auth** enabled and **Firestore** in production mode

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Firebase
Edit `lib/firebase.ts` and replace the `firebaseConfig` object with the values from your Firebase Console (Project Settings → Your apps):

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

### 3. Deploy Firestore rules
Copy the contents of `firestore.rules` into your Firebase project's Firestore Rules tab (or deploy via the Firebase CLI: `firebase deploy --only firestore:rules`).

### 4. Run the app
```bash
npm start          # Expo dev server (scan the QR with Expo Go)
npm run ios        # Build and run on iOS simulator
npm run android    # Build and run on Android emulator
```

### 5. First-run flow
1. Register a new account (name + email + password).
2. Choose "Create a new home" → name it → copy the invite code.
3. (Optional) On a second device, register another user, choose "Join", paste the code.
4. Start logging expenses and adding shared shopping items.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run ios` | Build and launch on the iOS simulator |
| `npm run android` | Build and launch on the Android emulator |

---

## Security Rules

`firestore.rules` enforces:
- `users/{uid}` — readable/writable only by that user.
- `houses/{houseId}` and all subcollections — readable/writable only by users whose UID is in the house's `memberIds` array.
- House membership check is done on every house-scoped read/write, so no cross-house data leakage is possible.

---

## License

Private project.
