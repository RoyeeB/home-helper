import SwiftUI

// MARK: - Shopping item classification
struct ItemInfo {
    let emoji: String
    let category: String
    let categoryEmoji: String
    let sortOrder: Int
}

func itemInfo(for name: String) -> ItemInfo {
    let n = name.lowercased()

    // (keywords, emoji, category, categoryEmoji, order)
    let rules: [(keywords: [String], emoji: String, cat: String, catEmoji: String, order: Int)] = [

        // ── שתייה / Drinks ──────────────────────────────  order 1
        (["מים מינרל","מים","water","mineral water","sparkling water","still water"],"💧","שתייה","🧃",1),
        (["קולה","פפסי","פנטה","ספרייט","קוקה","cola","pepsi","fanta","sprite","coke"],"🥤","שתייה","🧃",1),
        (["מיץ","juice","orange juice","apple juice"],         "🧃","שתייה","🧃",1),
        (["קפה","אספרסו","נסקפה","coffee","espresso","nescafe","cappuccino","latte"],"☕","שתייה","🧃",1),
        (["תה","tea","green tea","black tea","herbal tea"],    "🍵","שתייה","🧃",1),
        (["בירה","beer","ale","lager"],                       "🍺","שתייה","🧃",1),
        (["יין","wine","red wine","white wine","rose wine"],  "🍷","שתייה","🧃",1),
        (["וויסקי","וודקה","ערק","ליקר","whiskey","vodka","rum","gin","liqueur"],"🥃","שתייה","🧃",1),
        (["שמפניה","קאווה","פרוסקו","champagne","prosecco","cava"],"🍾","שתייה","🧃",1),
        (["אנרג'י","רד בול","פאוור","energy drink","red bull","monster"],"🥤","שתייה","🧃",1),
        (["שוקו","שוקוחלב","chocolate milk","cocoa"],         "🍫","שתייה","🧃",1),
        (["סודה","מים מוגזים","soda","soda water","club soda"],"🫧","שתייה","🧃",1),

        // ── מוצרי חלב / Dairy ───────────────────────────  order 2
        (["חלב","milk","whole milk","skim milk","low fat milk","oat milk","almond milk"],"🥛","מוצרי חלב","🥛",2),
        (["גבינה צהובה","גבינה קשה","עמק","גאודה","בולגרית","פרמזן","צ'דר","ברי","קממבר",
           "yellow cheese","cheddar","gouda","parmesan","brie","camembert","edam"],"🧀","מוצרי חלב","🥛",2),
        (["גבינה לבנה","גבינת שמנת","גבינת עיזים","קוטג","ריקוטה","מסקרפונה",
           "cream cheese","cottage cheese","ricotta","mascarpone","feta","goat cheese"],"🧀","מוצרי חלב","🥛",2),
        (["גבינה","cheese"],                                  "🧀","מוצרי חלב","🥛",2),
        (["יוגורט","yogurt","greek yogurt","kefir"],          "🫙","מוצרי חלב","🥛",2),
        (["שמנת","שמנת חמוצה","לבן","cream","sour cream","heavy cream","whipping cream"],"🥛","מוצרי חלב","🥛",2),
        (["חמאה","מרגרינה","butter","margarine"],             "🧈","מוצרי חלב","🥛",2),
        (["מוצרלה","mozzarella"],                             "🧀","מוצרי חלב","🥛",2),

        // ── פירות וירקות / Produce ──────────────────────  order 3
        (["חציל","eggplant","aubergine"],                    "🍆","פירות וירקות","🥬",3),
        (["מלפפון","מלפפונים","קישוא","cucumber","zucchini","courgette"],"🥒","פירות וירקות","🥬",3),
        (["עגבניה","עגבניות","תמטה","tomato","tomatoes","cherry tomato"],"🍅","פירות וירקות","🥬",3),
        (["פלפל אדום","red pepper","red bell pepper","chili pepper","hot pepper"],"🌶️","פירות וירקות","🥬",3),
        (["פלפל ירוק","פלפל צהוב","פלפל כתום","פלפל","bell pepper","green pepper","yellow pepper","pepper"],"🫑","פירות וירקות","🥬",3),
        (["גזר","carrot","carrots"],                         "🥕","פירות וירקות","🥬",3),
        (["בצל","onion","red onion","green onion","scallion"],"🧅","פירות וירקות","🥬",3),
        (["שום","garlic"],                                   "🧄","פירות וירקות","🥬",3),
        (["תפוח אדמה","תפוחי אדמה","פתיתים","potato","potatoes","sweet potato"],"🥔","פירות וירקות","🥬",3),
        (["ברוקולי","כרובית","broccoli","cauliflower"],       "🥦","פירות וירקות","🥬",3),
        (["כרוב","cabbage","red cabbage","kale"],             "🥬","פירות וירקות","🥬",3),
        (["חסה","עלי סלט","ארוגולה","רוקט","תרד","מנגולד","lettuce","salad","arugula","rocket","spinach","chard"],"🥬","פירות וירקות","🥬",3),
        (["סלרי","celery"],                                  "🌿","פירות וירקות","🥬",3),
        (["דלעת","בטטה","pumpkin","squash","butternut"],      "🎃","פירות וירקות","🥬",3),
        (["פטרייה","פטריות","mushroom","mushrooms","champignon"],"🍄","פירות וירקות","🥬",3),
        (["תירס","corn","sweet corn"],                       "🌽","פירות וירקות","🥬",3),
        (["אספרגוס","כרשה","שומר","asparagus","leek","fennel"],"🌿","פירות וירקות","🥬",3),
        (["כוסברה","פטרוזיליה","בזיליקום","נענע","שמיר","טימין","אורגנו",
           "cilantro","parsley","basil","mint","dill","thyme","oregano","rosemary"],"🌿","פירות וירקות","🥬",3),
        (["ג'ינג'ר","צ'ילי","ginger","chili","jalapeño"],    "🌶️","פירות וירקות","🥬",3),
        (["צנון","radish","daikon"],                         "🥕","פירות וירקות","🥬",3),
        (["ארטישוק","artichoke"],                            "🌿","פירות וירקות","🥬",3),
        (["זוקיני","courgette"],                             "🥒","פירות וירקות","🥬",3),
        (["תפוח","גרני","פרגינה","גולדן","apple","apples","granny smith","golden apple"],"🍎","פירות וירקות","🥬",3),
        (["אגס","pear","pears"],                             "🍐","פירות וירקות","🥬",3),
        (["בננה","בננות","banana","bananas"],                "🍌","פירות וירקות","🥬",3),
        (["תפוז","תפוזים","orange","oranges"],               "🍊","פירות וירקות","🥬",3),
        (["מנדרינה","קלמנטינה","קלמנטינות","mandarin","clementine","tangerine"],"🍊","פירות וירקות","🥬",3),
        (["לימון","lemon","lemons"],                         "🍋","פירות וירקות","🥬",3),
        (["ליים","lime","limes"],                            "🍋","פירות וירקות","🥬",3),
        (["אבטיח","watermelon"],                             "🍉","פירות וירקות","🥬",3),
        (["מלון","melon","cantaloupe","honeydew"],           "🍈","פירות וירקות","🥬",3),
        (["ענב","ענבים","grape","grapes"],                   "🍇","פירות וירקות","🥬",3),
        (["תות","תותים","strawberry","strawberries"],        "🍓","פירות וירקות","🥬",3),
        (["פטל","אוכמניות","דומדמניות","blueberry","blueberries","raspberry","blackberry"],"🫐","פירות וירקות","🥬",3),
        (["מנגו","mango","mangoes"],                         "🥭","פירות וירקות","🥬",3),
        (["אננס","pineapple"],                               "🍍","פירות וירקות","🥬",3),
        (["קוקוס","coconut"],                                "🥥","פירות וירקות","🥬",3),
        (["אבוקדו","avocado","avocados"],                    "🥑","פירות וירקות","🥬",3),
        (["אפרסק","נקטרינה","peach","nectarine","plum"],     "🍑","פירות וירקות","🥬",3),
        (["שזיף","plum","prune"],                            "🍑","פירות וירקות","🥬",3),
        (["דובדבן","cherry","cherries"],                     "🍒","פירות וירקות","🥬",3),
        (["קיווי","kiwi"],                                   "🥝","פירות וירקות","🥬",3),
        (["רימון","pomegranate"],                            "🍎","פירות וירקות","🥬",3),
        (["תמר","תמרים","date","dates","fig","figs"],        "🌴","פירות וירקות","🥬",3),
        (["אפרסמון","persimmon","lychee","litchi"],          "🍊","פירות וירקות","🥬",3),

        // ── מוצרי ניקוי / Cleaning ──────────────────────  order 4
        (["נייר טואלט","נייר טישו","toilet paper","tissues","paper tissue"],"🧻","מוצרי ניקוי","🧹",4),
        (["מגבות נייר","מגבות","paper towels","kitchen roll","paper towel"],"🧻","מוצרי ניקוי","🧹",4),
        (["אבקת כביסה","נוזל כביסה","מרכך כביסה","laundry detergent","washing powder","fabric softener","dryer sheets"],"🧺","מוצרי ניקוי","🧹",4),
        (["סבון כלים","נוזל כלים","פיירי","dish soap","washing up liquid","dishwasher tablets","fairy"],"🫧","מוצרי ניקוי","🧹",4),
        (["מנקה","ניקוי","קלינקס","bleach","cleaning spray","multi surface","bathroom cleaner","floor cleaner"],"🧴","מוצרי ניקוי","🧹",4),
        (["שקיות אשפה","trash bags","garbage bags","bin bags"],"🗑️","מוצרי ניקוי","🧹",4),
        (["ספוג","sponge","scrubber","dish sponge"],          "🧽","מוצרי ניקוי","🧹",4),
        (["מגב","mop","floor mop","broom"],                  "🧹","מוצרי ניקוי","🧹",4),
        (["כפפות","gloves","rubber gloves","cleaning gloves"],"🧤","מוצרי ניקוי","🧹",4),

        // ── חד פעמי / Disposables ───────────────────────  order 5
        (["כוסות חד פעמי","כוסות נייר","כוס חד פעמי","disposable cups","paper cups","plastic cups"],"🥤","חד פעמי","🥡",5),
        (["צלחות חד פעמי","צלחות נייר","צלחת חד פעמי","disposable plates","paper plates","plastic plates"],"🍽️","חד פעמי","🥡",5),
        (["מזלג","מזלגות","כפית","כפיות","סכין חד פעמי","כלי אוכל","כלי פלסטיק",
           "fork","forks","spoon","spoons","knife","plastic cutlery","disposable cutlery","utensils"],"🍴","חד פעמי","🥡",5),
        (["נייר כסף","רדיד אלומיניום","אלומיניום","aluminum foil","aluminium foil","tin foil"],"✨","חד פעמי","🥡",5),
        (["ניילון נצמד","ניילון","פלסטיק","plastic wrap","cling film","cling wrap","saran wrap"],"🛍️","חד פעמי","🥡",5),
        (["שקיות","שקית","bags","plastic bags","zip lock","ziploc","sandwich bags"],"🛍️","חד פעמי","🥡",5),
        (["נייר אפייה","ניר אפייה","baking paper","parchment paper","baking parchment"],"📄","חד פעמי","🥡",5),
        (["גביעים","גביע","מגשים חד פעמי","מגש חד פעמי","trays","disposable tray","takeout containers"],"🥡","חד פעמי","🥡",5),
        (["שיפודים","שיפוד","skewers","skewer","kebab skewers"],  "🍢","חד פעמי","🥡",5),
        (["קיסמים","קיסם","מקלות","toothpicks","wooden sticks","chopsticks"],"🪥","חד פעמי","🥡",5),
        (["מפיות","מפית","napkins","paper napkins","serviettes"], "🧻","חד פעמי","🥡",5),

        // ── ביצים / Eggs ────────────────────────────────  order 6
        (["ביצ","ביצים","egg","eggs","free range eggs"],      "🥚","ביצים","🥚",6),

        // ── לחם ומאפים / Bakery ─────────────────────────  order 7
        (["לחם","פרוסות","bread","sliced bread","white bread","whole wheat bread","sourdough"],"🍞","לחם ומאפים","🍞",7),
        (["פיתה","פיתות","לאפה","pita","pita bread","flatbread","tortilla","wrap"],"🫓","לחם ומאפים","🍞",7),
        (["בגט","סיאבטה","baguette","ciabatta","focaccia"],   "🥖","לחם ומאפים","🍞",7),
        (["חלה","challah"],                                   "🍞","לחם ומאפים","🍞",7),
        (["לחמניה","לחמניות","רול","rolls","bread rolls","buns","dinner rolls"],"🍞","לחם ומאפים","🍞",7),
        (["קרואסון","croissant","croissants"],                "🥐","לחם ומאפים","🍞",7),
        (["טוסט","toast","toaster bread"],                   "🍞","לחם ומאפים","🍞",7),
        (["עוגיה","עוגיות","ביסקוויט","cookie","cookies","biscuit","biscuits","crackers"],"🍪","לחם ומאפים","🍞",7),

        // ── בשר ועוף / Meat & Poultry ───────────────────  order 8
        (["עוף","פרגית","שוק עוף","חזה עוף","כנפיים","ירך",
           "chicken","chicken breast","chicken thigh","chicken wings","poultry"],"🍗","בשר ועוף","🥩",8),
        (["הודו","turkey"],                                   "🦃","בשר ועוף","🥩",8),
        (["בשר","סטייק","אנטריקוט","פילה","כתף","צלעות","צוואר",
           "beef","steak","ribeye","fillet","sirloin","ribs","lamb","meat"],"🥩","בשר ועוף","🥩",8),
        (["טחון","קציצ","המבורגר","בורגר","ground beef","minced meat","burger","hamburger","meatball"],"🥩","בשר ועוף","🥩",8),
        (["כבש","טלה","גדי","lamb","veal"],                  "🥩","בשר ועוף","🥩",8),
        (["שניצל","schnitzel"],                               "🍗","בשר ועוף","🥩",8),
        (["נקניק","נקניקיה","סלמי","פסטרמה","sausage","hot dog","salami","pastrami","deli meat","cold cuts"],"🌭","בשר ועוף","🥩",8),
        (["כבד","לשון","טחול","liver","tongue"],             "🥩","בשר ועוף","🥩",8),

        // ── דגים / Fish & Seafood ────────────────────────  order 9
        (["סלמון","salmon"],                                  "🐠","דגים","🐟",9),
        (["טונה","tuna","canned tuna"],                       "🐟","דגים","🐟",9),
        (["בורי","דניס","לברק","קרפיון","אמנון","מוסר","sea bass","sea bream","carp","tilapia","mullet"],"🐟","דגים","🐟",9),
        (["שרימפס","שריפ","shrimp","prawns"],                 "🦐","דגים","🐟",9),
        (["קלמרי","דיונון","squid","calamari","octopus"],     "🦑","דגים","🐟",9),
        (["סרדין","אנשובי","sardine","sardines","anchovy","anchovies"],"🐟","דגים","🐟",9),
        (["דג","fish","fillet","filet"],                      "🐟","דגים","🐟",9),

        // ── קטניות ודגנים / Grains & Legumes ───────────  order 10
        (["אורז","rice","white rice","brown rice","basmati","jasmine rice"],"🍚","קטניות ודגנים","🌾",10),
        (["פסטה","ספגטי","מקרוני","טליאטלה","פנה","ריגטוני","פוסילי",
           "pasta","spaghetti","penne","macaroni","tagliatelle","rigatoni","fusilli","noodles"],"🍝","קטניות ודגנים","🌾",10),
        (["קוסקוס","בורגול","couscous","bulgur","quinoa"],    "🌾","קטניות ודגנים","🌾",10),
        (["שיבולת שועל","גרנולה","קוואקר","oats","oatmeal","granola","muesli","cereal"],"🌾","קטניות ודגנים","🌾",10),
        (["קמח","סולת","flour","bread flour","self raising","semolina"],"🌾","קטניות ודגנים","🌾",10),
        (["עדשים","שעועית","חומוס","אפונה","פול","lentils","beans","chickpeas","peas","black beans","kidney beans"],"🫘","קטניות ודגנים","🌾",10),
        (["לחם קריספי","קרקר","פריכיות","cracker","rice cake","crispbread"],"🌾","קטניות ודגנים","🌾",10),
        (["שקדים","אגוזים","קשיו","פיסטוק","בוטנים","פקאן",
           "almonds","walnuts","cashews","pistachios","peanuts","pecans","hazelnuts","mixed nuts"],"🥜","קטניות ודגנים","🌾",10),
        (["גרעינים","זרעי","צ'יה","פשתן","seeds","chia","flaxseed","sunflower seeds","pumpkin seeds"],"🌾","קטניות ודגנים","🌾",10),

        // ── שמנים וממרחים / Oils & Spreads ──────────────  order 11
        (["שמן זית","olive oil"],                             "🫒","שמנים וממרחים","🫙",11),
        (["שמן","oil","vegetable oil","sunflower oil","coconut oil","canola oil"],"🫙","שמנים וממרחים","🫙",11),
        (["טחינה","tahini","tahina"],                         "🫙","שמנים וממרחים","🫙",11),
        (["דבש","honey"],                                     "🍯","שמנים וממרחים","🫙",11),
        (["ריבה","מרמלדה","ממרח","jam","jelly","marmalade","spread","peanut butter","nutella"],"🍯","שמנים וממרחים","🫙",11),
        (["מיונז","קטשופ","סויה","טריאקי","mayonnaise","ketchup","soy sauce","teriyaki","hot sauce"],"🫙","שמנים וממרחים","🫙",11),
        (["חרדל","mustard","dijon"],                          "🫙","שמנים וממרחים","🫙",11),
        (["מלח","פלפל שחור","פפריקה","כמון","כורכום","קינמון","הל","אניס","זעתר","סומאק",
           "salt","black pepper","paprika","cumin","turmeric","cinnamon","cardamom","spices","herbs","seasoning"],"🧂","שמנים וממרחים","🫙",11),
        (["סוכר","ונילין","אבקת אפייה","sugar","vanilla","baking powder","baking soda","yeast"],"🫙","שמנים וממרחים","🫙",11),
        (["חומץ","vinegar","apple cider vinegar","balsamic"],  "🫙","שמנים וממרחים","🫙",11),
        (["רוטב","פסטו","ראגו","sauce","pesto","pasta sauce","tomato sauce","gravy"],"🫙","שמנים וממרחים","🫙",11),

        // ── חטיפים וממתקים / Snacks & Sweets ────────────  order 12
        (["שוקולד","פרלין","טובלרון","קינדר","chocolate","kinder","toblerone","candy bar","dark chocolate"],"🍫","חטיפים וממתקים","🍫",12),
        (["גלידה","ארטיק","מקפיא","ice cream","gelato","sorbet","popsicle","frozen yogurt"],"🍦","חטיפים וממתקים","🍫",12),
        (["סוכריות","מסטיק","סוכרייה על מקל","candy","gum","chewing gum","lollipop","sweets"],"🍬","חטיפים וממתקים","🍫",12),
        (["במבה","ביסלי","bamba","bissli"],                   "🍿","חטיפים וממתקים","🍫",12),
        (["צ'יפס","פרינגלס","chips","crisps","pringles","potato chips"],"🥔","חטיפים וממתקים","🍫",12),
        (["פופקורן","popcorn"],                               "🍿","חטיפים וממתקים","🍫",12),
        (["עוגה","טארט","קינוח","cake","tart","dessert","muffin","brownie","cheesecake"],"🎂","חטיפים וממתקים","🍫",12),
        (["וופל","בלינצ'ס","waffle","crepe","pancake"],       "🧇","חטיפים וממתקים","🍫",12),
        (["חלווה","לוקום","halva","lokum","turkish delight"], "🍬","חטיפים וממתקים","🍫",12),

        // ── טיפוח / Personal Care ───────────────────────  order 13
        (["שמפו","shampoo","hair shampoo","dry shampoo"],     "🧴","טיפוח","🧴",13),
        (["מרכך שיער","conditioner","hair conditioner","hair mask"],"🧴","טיפוח","🧴",13),
        (["סבון גוף","סבון ידיים","סבון פנים","סבון","body wash","hand soap","face wash","soap","shower gel"],"🧼","טיפוח","🧴",13),
        (["קרם לחות","קרם פנים","קרם גוף","קרם","moisturizer","face cream","body lotion","lotion","sunscreen"],"🧴","טיפוח","🧴",13),
        (["דאודורנט","דאו","deodorant","antiperspirant"],     "🧴","טיפוח","🧴",13),
        (["משחת שיניים","מברשת שיניים","חוט דנטלי","toothpaste","toothbrush","dental floss","mouthwash"],"🪥","טיפוח","🧴",13),
        (["תחבושת","אספירין","תרופ","ויטמין","כדור","vitamin","medication","medicine","pills","bandage","plaster"],"💊","טיפוח","🧴",13),
        (["צמר גפן","cotton","cotton balls","cotton pads","q-tips","cotton buds"],"🧴","טיפוח","🧴",13),
        (["מספרים","מסרק","מכחול","איפור","ריסן","makeup","mascara","foundation","lipstick","eyeliner","nail polish"],"💄","טיפוח","🧴",13),
    ]

    for rule in rules {
        if rule.keywords.contains(where: { n.contains($0) }) {
            return ItemInfo(emoji: rule.emoji, category: rule.cat, categoryEmoji: rule.catEmoji, sortOrder: rule.order)
        }
    }
    return ItemInfo(emoji: "🛒", category: "אחר", categoryEmoji: "🛒", sortOrder: 99)
}

// MARK: - Shopping View
struct ShoppingView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @EnvironmentObject var houseVM: HouseViewModel
    @AppStorage("isHebrew") private var isHebrew = true
    @State private var itemName = ""
    @State private var qty = ""
    @State private var showClearAlert = false
    @State private var sortByCategory = false
    @FocusState private var inputFocused: Bool

    var unchecked: [ShoppingItem] { houseVM.shoppingItems.filter { !$0.checked } }
    var checked:   [ShoppingItem] { houseVM.shoppingItems.filter {  $0.checked } }

    // Group unchecked by category, sorted by supermarket order
    var groupedUnchecked: [(category: String, emoji: String, items: [ShoppingItem])] {
        let grouped = Dictionary(grouping: unchecked) { itemInfo(for: $0.name).category }
        return grouped.map { cat, items in
            let info = itemInfo(for: items[0].name)
            return (category: cat, emoji: info.categoryEmoji, items: items)
        }
        .sorted { a, b in
            let oa = itemInfo(for: a.items[0].name).sortOrder
            let ob = itemInfo(for: b.items[0].name).sortOrder
            return oa < ob
        }
    }

    var body: some View {
        NavigationStack {
            ZStack { Color.appBg.ignoresSafeArea()
                VStack(spacing: 0) {

                    // Add row
                    HStack(spacing: 10) {
                        TextField(isHebrew ? "כמות" : "Qty", text: $qty)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.center)
                            .padding(12)
                            .background(Color.appCard)
                            .clipShape(RoundedRectangle(cornerRadius: DS.radiusS))
                            .overlay(RoundedRectangle(cornerRadius: DS.radiusS).stroke(Color.appBorder, lineWidth: 1))
                            .foregroundColor(.white)
                            .frame(width: 64)
                            .focused($inputFocused)

                        TextField(isHebrew ? "הוסף פריט..." : "Add item...", text: $itemName)
                            .multilineTextAlignment(.trailing)
                            .padding(12)
                            .background(Color.appCard)
                            .clipShape(RoundedRectangle(cornerRadius: DS.radiusS))
                            .overlay(RoundedRectangle(cornerRadius: DS.radiusS).stroke(Color.appBorder, lineWidth: 1))
                            .foregroundColor(.white)
                            .focused($inputFocused)

                        Button {
                            Task { await addItem() }
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        } label: {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.system(size: 36))
                                .foregroundStyle(itemName.trimmingCharacters(in: .whitespaces).isEmpty ? Color.appMuted : Color.appPrimary)
                        }
                        .disabled(itemName.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                    .padding(.horizontal, DS.paddingL)
                    .padding(.vertical, 12)
                    .background(Color.appSurface)

                    if houseVM.shoppingItems.isEmpty {
                        Spacer()
                        VStack(spacing: 14) {
                            Text("🛒").font(.system(size: 56))
                            Text(isHebrew ? "רשימת הקניות ריקה" : "Shopping list is empty").font(.headline.weight(.semibold)).foregroundColor(.white)
                            Text(isHebrew ? "הוסף פריטים שצריך לקנות" : "Add items you need to buy").font(.subheadline).foregroundColor(Color.appSecondary)
                        }
                        Spacer()
                    } else {
                        List {
                            if sortByCategory {
                                // ── Grouped by category ──
                                ForEach(groupedUnchecked, id: \.category) { group in
                                    Section {
                                        ForEach(group.items) { item in
                                            itemRow(item, checked: false)
                                                .listRowBackground(Color.appCard)
                                                .listRowSeparatorTint(Color.appBorder)
                                                .listRowInsets(EdgeInsets(top: 0, leading: 16, bottom: 0, trailing: 16))
                                                .onTapGesture { toggle(item, to: true) }
                                                .swipeActions(edge: .leading, allowsFullSwipe: true) {
                                                    Button(role: .destructive) { toggle(item, to: true) }
                                                    label: { Label(isHebrew ? "סמן" : "Check", systemImage: "checkmark") }
                                                    .tint(Color.appSuccess)
                                                }
                                        }
                                    } header: {
                                        HStack(spacing: 6) {
                                            Text(group.emoji)
                                            Text(isHebrew ? group.category : (shoppingCategoryLabelsEn[group.category] ?? group.category))
                                                .font(.caption.weight(.bold))
                                                .foregroundColor(Color.appSecondary)
                                        }
                                        .textCase(nil)
                                        .padding(.vertical, 2)
                                    }
                                }
                            } else {
                                // ── Regular list ──
                                if !unchecked.isEmpty {
                                    Section {
                                        ForEach(unchecked) { item in
                                            itemRow(item, checked: false)
                                                .listRowBackground(Color.appCard)
                                                .listRowSeparatorTint(Color.appBorder)
                                                .listRowInsets(EdgeInsets(top: 0, leading: 16, bottom: 0, trailing: 16))
                                                .onTapGesture { toggle(item, to: true) }
                                                .swipeActions(edge: .leading, allowsFullSwipe: true) {
                                                    Button(role: .destructive) { toggle(item, to: true) }
                                                    label: { Label(isHebrew ? "סמן" : "Check", systemImage: "checkmark") }
                                                    .tint(Color.appSuccess)
                                                }
                                        }
                                    } header: {
                                        Text(isHebrew ? "לרכוש (\(unchecked.count))" : "To buy (\(unchecked.count))")
                                            .font(.caption.weight(.semibold))
                                            .foregroundColor(Color.appSecondary)
                                            .textCase(nil)
                                    }
                                }
                            }

                            // ── Checked items ──
                            if !checked.isEmpty {
                                Section {
                                    ForEach(checked) { item in
                                        itemRow(item, checked: true)
                                            .listRowBackground(Color.appCard.opacity(0.5))
                                            .listRowSeparatorTint(Color.appBorder)
                                            .listRowInsets(EdgeInsets(top: 0, leading: 16, bottom: 0, trailing: 16))
                                            .onTapGesture { toggle(item, to: false) }
                                    }
                                } header: {
                                    Text(isHebrew ? "נרכש (\(checked.count))" : "Bought (\(checked.count))")
                                        .font(.caption.weight(.semibold))
                                        .foregroundColor(Color.appMuted)
                                        .textCase(nil)
                                }
                            }
                        }
                        .listStyle(.insetGrouped)
                        .scrollContentBackground(.hidden)
                        .animation(.easeInOut(duration: 0.25), value: sortByCategory)
                    }
                }
            }
            .navigationTitle(isHebrew ? "רשימת קניות" : "Shopping List")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        withAnimation { sortByCategory.toggle() }
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: sortByCategory ? "list.bullet.indent" : "square.grid.2x2")
                                .font(.subheadline)
                            Text(sortByCategory ? (isHebrew ? "רשימה" : "List") : (isHebrew ? "לפי מחלקה" : "By Aisle"))
                                .font(.caption.weight(.medium))
                        }
                        .foregroundColor(sortByCategory ? Color.appPrimary : Color.appSecondary)
                        .padding(.horizontal, 10).padding(.vertical, 5)
                        .background(sortByCategory ? Color.appPrimary.opacity(0.12) : Color.appCard)
                        .clipShape(Capsule())
                    }
                }
                if !checked.isEmpty {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button { showClearAlert = true } label: {
                            Label(isHebrew ? "נקה (\(checked.count))" : "Clear (\(checked.count))", systemImage: "trash")
                                .font(.caption.weight(.medium))
                                .foregroundColor(Color.appDanger)
                        }
                    }
                }
            }
            .alert(isHebrew ? "ניקוי פריטים" : "Clear Items", isPresented: $showClearAlert) {
                Button(isHebrew ? "ביטול" : "Cancel", role: .cancel) {}
                Button(isHebrew ? "מחק \(checked.count) פריטים" : "Delete \(checked.count) items", role: .destructive) {
                    Task { try? await houseVM.clearCheckedItems() }
                }
            }
        }
    }

    func toggle(_ item: ShoppingItem, to checked: Bool) {
        UIImpactFeedbackGenerator(style: checked ? .medium : .light).impactOccurred()
        Task { try? await houseVM.toggleShoppingItem(item.id ?? "", checked: checked) }
    }

    func itemRow(_ item: ShoppingItem, checked: Bool) -> some View {
        let info = itemInfo(for: item.name)
        return HStack(spacing: 12) {
            // Checkbox
            ZStack {
                Circle()
                    .stroke(checked ? Color.appSuccess : Color.appBorder, lineWidth: 1.5)
                    .frame(width: 24, height: 24)
                if checked {
                    Circle().fill(Color.appSuccess).frame(width: 24, height: 24)
                    Image(systemName: "checkmark").font(.system(size: 10, weight: .bold)).foregroundColor(.white)
                }
            }

            Text(info.emoji).font(.title3)

            VStack(alignment: .trailing, spacing: 2) {
                Text(item.name)
                    .font(.subheadline.weight(checked ? .regular : .medium))
                    .foregroundColor(checked ? Color.appSecondary : .white)
                    .strikethrough(checked, color: Color.appMuted)
                if !item.qty.isEmpty {
                    Text(item.qty).font(.caption).foregroundColor(Color.appMuted)
                }
            }

            Spacer()

            Text(item.addedBy).font(.caption2).foregroundColor(Color.appMuted)
        }
        .padding(.vertical, 10)
        .opacity(checked ? 0.55 : 1)
        .animation(.easeInOut(duration: 0.2), value: checked)
    }

    func addItem() async {
        let name = itemName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty, let profile = authVM.profile else { return }
        try? await houseVM.addShoppingItem(name: name, qty: qty.trimmingCharacters(in: .whitespaces), addedBy: profile.displayName)
        itemName = ""; qty = ""
    }
}
