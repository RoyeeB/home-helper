// Centralized translations. Add new keys here.
// To use: const { t } = useLanguage(); ... t('settings.title')

export type Language = 'en' | 'he';

export const TRANSLATIONS = {
  // ─── Common ──────────────────────────────────────────────────────────────
  common: {
    cancel:    { en: 'Cancel',    he: 'ביטול' },
    save:      { en: 'Save',      he: 'שמירה' },
    delete:    { en: 'Delete',    he: 'מחיקה' },
    edit:      { en: 'Edit',      he: 'עריכה' },
    close:     { en: 'Close',     he: 'סגירה' },
    back:      { en: 'Back',      he: 'חזרה' },
    error:     { en: 'Error',     he: 'שגיאה' },
    loading:   { en: 'Loading…',  he: 'טוען…' },
    search:    { en: 'Search…',   he: 'חיפוש…' },
    update:    { en: 'Update',    he: 'עדכון' },
    optional:  { en: 'Optional',  he: 'אופציונלי' },
    none:      { en: 'None',      he: 'ללא' },
    you:       { en: 'You',       he: 'אני' },
    total:     { en: 'Total',     he: 'סה״כ' },
    add:       { en: 'Add',       he: 'הוספה' },
  },

  // ─── Auth ────────────────────────────────────────────────────────────────
  auth: {
    loginTitle:        { en: 'Welcome back',         he: 'ברוך שובך' },
    loginSubtitle:     { en: 'Sign in to continue',  he: 'התחבר כדי להמשיך' },
    registerTitle:     { en: 'Create account',       he: 'יצירת חשבון' },
    registerSubtitle:  { en: 'Join Home Helper',     he: 'הצטרף ל-Home Helper' },
    fullName:          { en: 'Full name',            he: 'שם מלא' },
    fullNameHint:      { en: 'John Doe',             he: 'ישראל ישראלי' },
    email:             { en: 'Email address',        he: 'כתובת מייל' },
    password:          { en: 'Password',             he: 'סיסמה' },
    passwordHint:      { en: 'At least 6 characters', he: 'לפחות 6 תווים' },
    passwordHelp:      { en: 'Use a strong password with letters and numbers', he: 'מומלץ להשתמש בסיסמה חזקה עם מספרים ואותיות' },
    login:             { en: 'Sign in',              he: 'התחברות' },
    register:          { en: 'Sign up',              he: 'הרשמה' },
    haveAccount:       { en: 'Already have an account?', he: 'כבר יש לך חשבון?' },
    noAccount:         { en: "Don't have an account?",   he: 'אין לך חשבון?' },
    signInLink:        { en: 'Sign in',              he: 'התחבר' },
    signUpLink:        { en: 'Sign up',              he: 'הירשם' },
    fillAllFields:     { en: 'Please fill all fields', he: 'יש למלא את כל השדות' },
    passwordTooShort:  { en: 'Password must be at least 6 characters', he: 'הסיסמה חייבת להכיל לפחות 6 תווים' },
    emailInUse:        { en: 'This email is already registered', he: 'כתובת המייל כבר קיימת במערכת' },
    invalidCreds:      { en: 'Invalid email or password', he: 'מייל או סיסמה לא נכונים' },
    genericRegError:   { en: 'Failed to create account',  he: 'שגיאה ביצירת החשבון' },
    genericLoginError: { en: 'Failed to sign in',         he: 'שגיאה בהתחברות' },
  },

  // ─── House setup ─────────────────────────────────────────────────────────
  house: {
    setupTitle:    { en: 'Set up your home',        he: 'הגדרת בית' },
    setupSubtitle: { en: 'Create a new home or join an existing one', he: 'צור בית חדש או הצטרף לקיים' },
    create:        { en: 'Create new home',          he: 'יצירת בית חדש' },
    createDesc:    { en: 'Set up a home and get an invite code', he: 'הגדר בית וקבל קוד הזמנה' },
    join:          { en: 'Join a home',              he: 'הצטרפות לבית' },
    joinDesc:      { en: 'Enter the code you received', he: 'הזן קוד שקיבלת מבן הבית' },
    homeName:      { en: 'Home name',                he: 'שם הבית' },
    homeNameHint:  { en: 'e.g. The Cohens',          he: 'לדוגמה: "משפחת כהן"' },
    inviteCode:    { en: 'House code (6 digits)',    he: 'קוד הבית (6 ספרות)' },
    inviteCodeHint:{ en: '6-digit code',             he: 'קוד 6 ספרות' },
    createBtn:     { en: 'Create home',              he: 'יצירת בית' },
    joinBtn:       { en: 'Join',                     he: 'הצטרפות' },
    nameRequired:  { en: 'Please enter a home name', he: 'יש להזין שם לבית' },
    invalidCode:   { en: 'Please enter a 6-digit code', he: 'יש להזין קוד בן 6 ספרות' },
    notFound:      { en: 'No home found with this code', he: 'לא נמצא בית עם קוד זה' },
    createError:   { en: 'Failed to create the home', he: 'שגיאה ביצירת הבית' },
    joinError:     { en: 'Failed to join the home',   he: 'שגיאה בהצטרפות לבית' },
    successTitle:  { en: 'Home created!',             he: 'הבית נוצר בהצלחה!' },
    successHint:   { en: 'Share this code with your housemates so they can join:', he: 'שתף את הקוד עם בני הבית כדי שיצטרפו:' },
    shareInvite:   { en: 'Share invite code',         he: 'שתף קוד הזמנה' },
    redirecting:   { en: 'Taking you to the app…',    he: 'מעביר אותך לאפליקציה...' },
  },

  // ─── Tabs ────────────────────────────────────────────────────────────────
  tabs: {
    dashboard:  { en: 'Dashboard', he: 'בית' },
    expenses:   { en: 'Expenses',  he: 'הוצאות' },
    fixed:      { en: 'Fixed',     he: 'קבועות' },
    charts:     { en: 'Charts',    he: 'גרפים' },
    shopping:   { en: 'Shopping',  he: 'קניות' },
  },

  // ─── Expenses ────────────────────────────────────────────────────────────
  expenses: {
    headerOverline: { en: 'EXPENSE TRACKER',  he: 'מעקב הוצאות' },
    title:          { en: 'Expenses',         he: 'הוצאות' },
    addTitle:       { en: 'Add expense',      he: 'הוספת הוצאה' },
    editTitle:      { en: 'Edit expense',     he: 'עריכת הוצאה' },
    description:    { en: 'Description',      he: 'תיאור' },
    descHint:       { en: 'e.g. Grocery run',  he: 'לדוגמה: קניות סופר' },
    amount:         { en: 'Amount (₪)',        he: 'סכום (₪)' },
    category:       { en: 'Category',          he: 'קטגוריה' },
    note:           { en: 'Note (optional)',   he: 'הערה (אופציונלי)' },
    noteHint:       { en: 'More details…',     he: 'פרטים נוספים...' },
    fillRequired:   { en: 'Please fill description and amount', he: 'יש למלא תיאור וסכום' },
    invalidAmount:  { en: 'Invalid amount',    he: 'סכום לא תקין' },
    saveError:      { en: 'Failed to save',    he: 'שגיאה בשמירה' },
    deleteTitle:    { en: 'Delete expense',    he: 'מחיקת הוצאה' },
    deleteConfirm:  { en: 'Delete "{name}"?',  he: 'למחוק את "{name}"?' },
    emptyTitle:     { en: 'No expenses for this month', he: 'אין הוצאות לחודש זה' },
    emptyHint:      { en: 'Tap + to add your first expense', he: 'הוסף את ההוצאה הראשונה עם הכפתור +' },
    notFoundTitle:  { en: 'No expenses found', he: 'לא נמצאו הוצאות' },
    notFoundHint:   { en: 'Try changing your search or filter', he: 'נסה לשנות את החיפוש או את הסינון' },
    all:            { en: 'All',               he: 'הכל' },
  },

  // ─── Categories ──────────────────────────────────────────────────────────
  categories: {
    food:           { en: 'Food',           he: 'אוכל' },
    transport:      { en: 'Transport',      he: 'תחבורה' },
    entertainment:  { en: 'Entertainment',  he: 'בידור' },
    health:         { en: 'Health',         he: 'בריאות' },
    clothing:       { en: 'Clothing',       he: 'לבוש' },
    home:           { en: 'Home',           he: 'בית' },
    education:      { en: 'Education',      he: 'חינוך' },
    other:          { en: 'Other',          he: 'אחר' },
  },

  // ─── Charts ──────────────────────────────────────────────────────────────
  charts: {
    overline:           { en: 'ANALYTICS',           he: 'ניתוח' },
    title:              { en: 'Charts',              he: 'גרפים' },
    variableExpenses:   { en: 'Variable expenses',   he: 'הוצאות משתנות' },
    emptyTitle:         { en: 'No data yet',         he: 'אין נתונים עדיין' },
    emptyHint:          { en: 'Charts will appear when you add expenses', he: 'כשתתחיל להוסיף הוצאות, הגרפים יופיעו כאן' },
    byCategory:         { en: 'By category',         he: 'פירוט לפי קטגוריה' },
    monthlyTrend:       { en: 'Monthly trend',       he: 'מגמה חודשית' },
    sixMonthsTotal:     { en: '6 months · including fixed', he: '6 חודשים · כולל הוצאות קבועות' },
    variableSubtitle:   { en: '6 months · variable expenses', he: '6 חודשים · הוצאות משתנות' },
    tapHint:            { en: 'tap a month to switch', he: 'לחיצה על חודש מחליפה' },
    byMember:           { en: 'By member',           he: 'פירוט לפי חבר' },
    byMemberMonthly:    { en: 'Members across months', he: 'חברים לאורך החודשים' },
    byMemberMonthlyHint:{ en: '6 months · variable spend per member', he: '6 חודשים · הוצאות משתנות לכל חבר' },
    variableMonth:      { en: '{month} · variable expenses', he: '{month} · הוצאות משתנות' },
    deltaFromPrev:      { en: '{pct}% from previous month', he: '{pct}% מהחודש הקודם' },
  },

  // ─── Settings ────────────────────────────────────────────────────────────
  settings: {
    title:           { en: 'Settings',           he: 'הגדרות' },
    myHome:          { en: 'My Home',            he: 'הבית שלי' },
    homeName:        { en: 'Home name',          he: 'שם הבית' },
    members:         { en: 'Members',            he: 'בני בית' },
    inviteCode:      { en: 'Invitation code',    he: 'קוד הזמנה' },
    share:           { en: 'Share',              he: 'שתף' },
    shareCodeA11y:   { en: 'Share invite code',  he: 'שתף קוד הצטרפות' },
    houseMembers:    { en: 'House members',      he: 'חברי הבית' },
    monthlyBudget:   { en: 'Monthly budget by category', he: 'תקציב חודשי לפי קטגוריה' },
    budgetHint:      {
      en: 'Set a monthly target per category — you’ll see indicators in the dashboard as you approach the limit.',
      he: 'הגדר יעד חודשי לכל קטגוריה — תקבל אינדיקציה בלוח הבקרה כשאתה מתקרב לגבול.',
    },
    noBudget:        { en: 'No budget',          he: 'ללא תקציב' },
    editBudgetA11y:  { en: 'Edit budget {cat}',  he: 'ערוך תקציב {cat}' },
    budgetTitle:     { en: 'Budget · {cat}',     he: 'תקציב · {cat}' },
    monthlyAmount:   { en: 'Monthly amount (₪)', he: 'סכום חודשי (₪)' },
    removeBudgetHint:{ en: 'Enter 0 to remove the budget', he: 'הזן 0 כדי להסיר את התקציב' },
    account:         { en: 'Account',            he: 'חשבון' },
    logout:          { en: 'Sign out',           he: 'התנתקות' },
    logoutConfirmT:  { en: 'Sign out',           he: 'התנתקות' },
    logoutConfirmM:  { en: 'Sign out of your account?', he: 'האם להתנתק מהחשבון?' },
    logoutBtn:       { en: 'Sign out',           he: 'התנתק' },
    appearance:      { en: 'Appearance',         he: 'תצוגה' },
    language:        { en: 'Language',           he: 'שפה' },
    languageEnglish: { en: 'English',            he: 'אנגלית' },
    languageHebrew:  { en: 'Hebrew',             he: 'עברית' },
    restartTitle:    { en: 'Restart required',   he: 'נדרש איתחול' },
    restartMsg:      { en: 'The app needs to restart to switch the language.', he: 'יש לאתחל את האפליקציה כדי להחליף את השפה.' },
    restartBtn:      { en: 'Restart now',        he: 'אתחל עכשיו' },
    shareMessage:    { en: 'Join the home "{name}" on Home Helper with code: {code}', he: 'הצטרף לבית "{name}" ב-Home Helper עם הקוד: {code}' },
    invalidAmount:   { en: 'Invalid amount',     he: 'סכום לא תקין' },
  },

  // ─── Shopping ────────────────────────────────────────────────────────────
  shopping: {
    overline:     { en: 'SHOPPING LIST',       he: 'רשימת קניות' },
    title:        { en: 'Shopping list',       he: 'רשימת קניות' },
    addItem:      { en: 'Add item',            he: 'הוספת פריט' },
    itemName:     { en: 'Item name',           he: 'שם הפריט' },
    qty:          { en: 'Qty',                 he: 'כמות' },
    pending:      { en: '{count} pending',     he: '{count} ממתינים' },
    completed:    { en: '{count} done',        he: '{count} סומנו' },
    emptyTitle:   { en: 'Shopping list is empty', he: 'רשימת הקניות ריקה' },
    emptyHint:    { en: 'Add an item with +',  he: 'הוסף פריט עם הכפתור +' },
    clearTitle:   { en: 'Clear completed',     he: 'ניקוי' },
    clearMsg:     { en: 'Delete {count} completed items?', he: 'למחוק {count} פריטים מסומנים?' },
    clearBtn:     { en: 'Clear',               he: 'ניקוי' },
    sectionDone:  { en: 'Completed',           he: 'הושלמו' },
  },

  // ─── Fixed costs ─────────────────────────────────────────────────────────
  fixed: {
    overline:    { en: 'RECURRING',           he: 'קבועות' },
    title:       { en: 'Fixed costs',         he: 'הוצאות קבועות' },
    addTitle:    { en: 'Add fixed cost',      he: 'הוספת הוצאה קבועה' },
    editTitle:   { en: 'Edit fixed cost',     he: 'עריכת הוצאה קבועה' },
    name:        { en: 'Name',                he: 'שם' },
    type:        { en: 'Type',                he: 'סוג' },
    amount:      { en: 'Amount (₪)',          he: 'סכום (₪)' },
    dayOfMonth:  { en: 'Day of month',        he: 'יום בחודש' },
    emptyTitle:  { en: 'No fixed costs yet',  he: 'אין הוצאות קבועות' },
    emptyHint:   { en: 'Tap + to add your first fixed cost', he: 'הוסף הוצאה קבועה ראשונה עם הכפתור +' },
    deleteTitle: { en: 'Delete fixed cost',   he: 'מחיקת הוצאה קבועה' },
    deleteConfirm:{ en: 'Delete "{name}"?',   he: 'למחוק את "{name}"?' },
    invalidAmount:{ en: 'Invalid amount',     he: 'סכום לא תקין' },
    invalidDay:  { en: 'Day must be 1-31',    he: 'יום חייב להיות בין 1 ל-31' },
    monthlyTotal:{ en: 'Monthly total',       he: 'סה״כ חודשי' },
    yearlyTotal: { en: 'Yearly total',        he: 'סה״כ שנתי' },
    dayLabel:    { en: 'Day {day}',           he: 'יום {day}' },
  },

  // ─── Fixed cost types ────────────────────────────────────────────────────
  fixedTypes: {
    rent:         { en: 'Rent',         he: 'שכר דירה' },
    mortgage:     { en: 'Mortgage',     he: 'משכנתא' },
    electricity:  { en: 'Electricity',  he: 'חשמל' },
    water:        { en: 'Water',        he: 'מים' },
    internet:     { en: 'Internet',     he: 'אינטרנט' },
    gas:          { en: 'Gas',          he: 'גז' },
    insurance:    { en: 'Insurance',    he: 'ביטוח' },
    subscription: { en: 'Subscription', he: 'מנוי' },
    other:        { en: 'Other',        he: 'אחר' },
  },

  // ─── Dashboard / Index ───────────────────────────────────────────────────
  dashboard: {
    hello:           { en: 'Hello',                  he: 'שלום' },
    monthTotal:      { en: 'Total spent this month', he: 'סה״כ הוצאות החודש' },
    variable:        { en: 'Variable',               he: 'משתנות' },
    fixed:           { en: 'Fixed',                  he: 'קבועות' },
    avgPerExpense:   { en: 'Avg / expense',          he: 'ממוצע להוצאה' },
    transactions:    { en: 'Transactions',           he: 'תנועות החודש' },
    members:         { en: 'Members',                he: 'בני בית' },
    fixedCount:      { en: 'Fixed costs',            he: 'הוצאות קבועות' },
    upcoming:        { en: 'Upcoming charges',       he: 'חיובים קרובים' },
    upcomingHint:    { en: 'Next 7 days',            he: '7 הימים הבאים' },
    today:           { en: 'Today',                  he: 'היום' },
    tomorrow:        { en: 'Tomorrow',               he: 'מחר' },
    inDays:          { en: 'In {days} days',         he: 'בעוד {days} ימים' },
    onDayOfMonth:    { en: 'Day {day} of month',     he: 'יום {day} לחודש' },
    monthlyBudget:   { en: 'Monthly budget',         he: 'תקציב חודשי' },
    catsTracked:     { en: '{count} categories tracked', he: '{count} קטגוריות מנוטרות' },
    edit:            { en: 'Edit',                   he: 'ערוך' },
    setBudget:       { en: 'Set monthly budget',     he: 'הגדר תקציב חודשי' },
    setBudgetDesc:   { en: 'Track expenses against a goal per category', he: 'עקוב אחרי הוצאות מול יעד לכל קטגוריה' },
    openBudgetA11y:  { en: 'Open budget settings',   he: 'פתיחת הגדרות תקציב' },
    byMember:        { en: 'By member',              he: 'פירוט לפי חבר' },
    variableExpenses:{ en: 'Variable expenses',      he: 'הוצאות משתנות' },
    pctOfMonth:      { en: '{pct}% of monthly spend', he: '{pct}% מהוצאות החודש' },
    recentExpenses:  { en: 'Recent expenses',        he: 'הוצאות אחרונות' },
    seeAll:          { en: 'See all',                he: 'ראה הכל' },
    emptyMonthTitle: { en: 'No expenses this month', he: 'אין הוצאות החודש' },
    emptyMonthHint:  { en: 'Add your first expense from the Expenses tab', he: 'הוסף את ההוצאה הראשונה מטאב ההוצאות' },
    settingsA11y:    { en: 'Settings',               he: 'הגדרות' },
  },
} as const;

type Path<T, P extends string = ''> = T extends object
  ? { [K in keyof T]: T[K] extends { en: string; he: string }
      ? P extends '' ? `${K & string}` : `${P}.${K & string}`
      : Path<T[K], P extends '' ? `${K & string}` : `${P}.${K & string}`>
    }[keyof T]
  : never;

export type TKey = Path<typeof TRANSLATIONS>;

function getValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

export function translate(
  key: string,
  lang: Language,
  vars?: Record<string, string | number>
): string {
  const entry = getValue(TRANSLATIONS, key);
  if (!entry || typeof entry[lang] !== 'string') {
    if (__DEV__) console.warn(`Missing translation key: ${key}`);
    return key;
  }
  let str: string = entry[lang];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}
