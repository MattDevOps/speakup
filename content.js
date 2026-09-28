/* ══════════════════════════════════
   CONTENT (shared by index.html and dashboard.html)
   Word fields: e = English, h = Hebrew meaning,
   p = how to say it (English sounds in Hebrew letters), x = example sentence
══════════════════════════════════ */
const LEVEL_META={
  beginner:    {key:'beginner',    icon:'🌱',label:'Beginner',    labelHe:'מתחיל',  unitHe:'מילים',   lc:'lc-b',fill:'fill-b',bdg:'bdg-b',pip:'pip-b',descHe:'מילים בסיסיות – מתאים למי שמתחיל מאפס'},
  intermediate:{key:'intermediate',icon:'🌿',label:'Intermediate',labelHe:'בינוני', unitHe:'ביטויים', lc:'lc-i',fill:'fill-i',bdg:'bdg-i',pip:'pip-i',descHe:'משפטים שימושיים ליום-יום'},
  advanced:    {key:'advanced',    icon:'🌳',label:'Advanced',    labelHe:'מתקדם',  unitHe:'ביטויים', lc:'lc-a',fill:'fill-a',bdg:'bdg-a',pip:'pip-a',descHe:'ניבים וביטויים מורכבים'},
};
const USERS=[
  {id:'sara',  name:'Sara',  nameHe:'שרה',  emoji:'👩'},
  {id:'shira', name:'Shira', nameHe:'שירה', emoji:'👧'},
  {id:'shlomo',name:'Shlomo',nameHe:'שלמה', emoji:'👨'},
  {id:'orly',  name:'Orly',  nameHe:'אורלי',emoji:'🧑'},
];
const LESSONS={
  beginner:[
    {id:'greetings',he:'ברכות',en:'Greetings',emoji:'👋',words:[
      {e:'Hello',h:'שלום',p:'הֶלוֹ',x:'Hello! Nice to meet you.'},
      {e:'Good morning',h:'בוקר טוב',p:'גוּד מוֹרְנִינְג',x:'Good morning! How are you?'},
      {e:'Good night',h:'לילה טוב',p:'גוּד נַיְט',x:'Good night, sleep well.'},
      {e:'Goodbye',h:'להתראות',p:'גוּדְבַּיי',x:'Goodbye, see you tomorrow!'},
      {e:'Thank you',h:'תודה',p:'תֶ׳נְק יוּ',x:'Thank you very much!'},
      {e:'Please',h:'בבקשה',p:'פְּלִיז',x:'Can I have water, please?'},
      {e:'Yes',h:'כן',p:'יֶס',x:'Yes, I understand.'},
      {e:'No',h:'לא',p:'נוֹ',x:'No, thank you.'},
    ]},
    {id:'numbers',he:'מספרים',en:'Numbers',emoji:'🔢',words:[
      {e:'One',h:'אחת',p:'וַואן',x:'One coffee, please.'},
      {e:'Two',h:'שתיים',p:'טוּ',x:'Two apples, please.'},
      {e:'Three',h:'שלוש',p:'תְ׳רִי',x:'I need three minutes.'},
      {e:'Four',h:'ארבע',p:'פוֹר',x:'Table for four, please.'},
      {e:'Five',h:'חמש',p:'פַיְב',x:'Five more minutes!'},
      {e:'Ten',h:'עשר',p:'טֶן',x:'Ten minutes later.'},
      {e:'Twenty',h:'עשרים',p:'טְוֶונְטִי',x:'Twenty dollars, please.'},
      {e:'One hundred',h:'מאה',p:'וַואן הַאנְדְרֶד',x:'One hundred percent!'},
    ]},
    {id:'colors',he:'צבעים',en:'Colors',emoji:'🎨',words:[
      {e:'Red',h:'אדום',p:'רֶד',x:'I like the red one.'},
      {e:'Blue',h:'כחול',p:'בְּלוּ',x:'The sky is blue.'},
      {e:'Green',h:'ירוק',p:'גְרִין',x:'Grass is green.'},
      {e:'Yellow',h:'צהוב',p:'יֶלוֹ',x:'The sun is yellow.'},
      {e:'White',h:'לבן',p:'וַויְט',x:'I want the white shirt.'},
      {e:'Black',h:'שחור',p:'בְּלֶק',x:'Black coffee, please.'},
      {e:'Orange',h:'כתום',p:'אוֹרֶנְג׳',x:'I want an orange juice.'},
      {e:'Pink',h:'ורוד',p:'פִּינְק',x:'She loves pink flowers.'},
    ]},
    {id:'family',he:'משפחה',en:'Family',emoji:'👨‍👩‍👧',words:[
      {e:'Mother',h:'אמא',p:'מַאדֶ׳ר',x:'My mother is very kind.'},
      {e:'Father',h:'אבא',p:'פַאדֶ׳ר',x:'My father works here.'},
      {e:'Brother',h:'אח',p:'בְּרַאדֶ׳ר',x:'This is my brother.'},
      {e:'Sister',h:'אחות',p:'סִיסְטֶר',x:'My sister is a doctor.'},
      {e:'Son',h:'בן',p:'סַאן',x:'He is my son.'},
      {e:'Daughter',h:'בת',p:'דוֹטֶר',x:'She is my daughter.'},
      {e:'Grandmother',h:'סבתא',p:'גְרֶנְד-מַאדֶ׳ר',x:'I love my grandmother.'},
      {e:'Grandfather',h:'סבא',p:'גְרֶנְד-פַאדֶ׳ר',x:'My grandfather is funny.'},
    ]},
    {id:'food',he:'אוכל ושתייה',en:'Food & Drink',emoji:'🍎',words:[
      {e:'Water',h:'מים',p:'ווֹטֶר',x:'Can I have some water?'},
      {e:'Bread',h:'לחם',p:'בְּרֶד',x:'Fresh bread, please.'},
      {e:'Coffee',h:'קפה',p:'קוֹפִי',x:'One coffee, please.'},
      {e:'Milk',h:'חלב',p:'מִילְק',x:'I take milk in my coffee.'},
      {e:'Chicken',h:'עוף',p:'צִ׳יקֶן',x:'I will have the chicken.'},
      {e:'Salad',h:'סלט',p:'סֶלֶד',x:'A salad, please.'},
      {e:'Juice',h:'מיץ',p:'ג׳וּס',x:'Orange juice, please.'},
      {e:'Dessert',h:'קינוח',p:'דִיזֶרְט',x:'What desserts do you have?'},
    ]},
    {id:'body',he:'חלקי הגוף',en:'Body Parts',emoji:'🧍',words:[
      {e:'Head',h:'ראש',p:'הֶד',x:'My head hurts.'},
      {e:'Hand',h:'יד',p:'הֶנְד',x:'Give me your hand.'},
      {e:'Eye',h:'עין',p:'אַיי',x:'I have something in my eye.'},
      {e:'Ear',h:'אוזן',p:'אִיר',x:'My ear hurts.'},
      {e:'Nose',h:'אף',p:'נוֹז',x:'I have a runny nose.'},
      {e:'Mouth',h:'פה',p:'מַאוּת׳',x:'Open your mouth wide.'},
      {e:'Leg',h:'רגל',p:'לֶג',x:'My leg is tired.'},
      {e:'Back',h:'גב',p:'בֶּק',x:'My back hurts today.'},
    ]},
  ],
  intermediate:[
    {id:'verbs',he:'משפטים שימושיים',en:'Useful Phrases',emoji:'⚡',words:[
      {e:'I would like',h:'הייתי רוצה',p:'אַיי ווּד לַייק',x:'I would like a table for two.'},
      {e:'Can you help me?',h:'אפשר לעזור לי?',p:'קֶן יוּ הֶלְפּ מִי?',x:'Excuse me, can you help me?'},
      {e:'Where is the bathroom?',h:'איפה השירותים?',p:'ווֶר אִיז דֶ׳ה בַּאת׳רוּם?',x:'Sorry, where is the bathroom?'},
      {e:'How much does it cost?',h:'כמה זה עולה?',p:'הַאוּ מַאץ׳ דַאז אִיט קוֹסְט?',x:'Excuse me, how much does it cost?'},
      {e:'I do not understand',h:'אני לא מבין/ה',p:'אַיי דוּ נוֹט אַנְדֶרְסְטֶנְד',x:'Sorry, I do not understand.'},
      {e:'Can you repeat that?',h:'אפשר לחזור על זה?',p:'קֶן יוּ רִיפִּיט דֶ׳ט?',x:'Can you repeat that more slowly?'},
      {e:'I am looking for',h:'אני מחפש/ת',p:'אַיי אֶם לוּקִינְג פוֹר',x:'I am looking for the train station.'},
      {e:'My name is',h:'השם שלי הוא...',p:'מַיי נֵיים אִיז',x:'Hi! My name is Sarah.'},
    ]},
    {id:'time',he:'זמן וימים',en:'Time & Days',emoji:'🕐',words:[
      {e:'What time is it?',h:'מה השעה?',p:'ווֹט טַיְים אִיז אִיט?',x:'Excuse me, what time is it?'},
      {e:'Today',h:'היום',p:'טוּדֵיי',x:'Today is Monday.'},
      {e:'Tomorrow',h:'מחר',p:'טוּמוֹרוֹ',x:'See you tomorrow!'},
      {e:'Yesterday',h:'אתמול',p:'יֶסְטֶרְדֵיי',x:'I called yesterday.'},
      {e:'In the morning',h:'בבוקר',p:'אִין דֶ׳ה מוֹרְנִינְג',x:'I wake up in the morning.'},
      {e:'In the evening',h:'בערב',p:'אִין דִ׳י אִיבְנִינְג',x:'I exercise in the evening.'},
      {e:'Next week',h:'בשבוע הבא',p:'נֶקְסְט וִויק',x:'I will call you next week.'},
      {e:'Right now',h:'ממש עכשיו',p:'רַייט נַאוּ',x:'I need help right now!'},
    ]},
    {id:'travel',he:'נסיעות',en:'Travel',emoji:'✈️',words:[
      {e:'Where is the airport?',h:'איפה שדה התעופה?',p:'ווֶר אִיז דִ׳י אֶרְפּוֹרְט?',x:'Excuse me, where is the airport?'},
      {e:'I need a taxi',h:'אני צריך/ה מונית',p:'אַיי נִיד אֶה טֶקְסִי',x:'Can you call me a taxi, please?'},
      {e:'One ticket please',h:'כרטיס אחד בבקשה',p:'וַואן טִיקֶט פְּלִיז',x:'One ticket to Tel Aviv, please.'},
      {e:'What gate?',h:'איזה שער?',p:'ווֹט גֵייט?',x:'Excuse me, what gate is my flight?'},
      {e:'My bag is lost',h:'התיק שלי אבד',p:'מַיי בֶּג אִיז לוֹסְט',x:'My bag is lost. Can you help me?'},
      {e:'I have a reservation',h:'יש לי הזמנה',p:'אַיי הֶב אֶה רֶזֶרְבֵיישֶן',x:'I have a reservation under my name.'},
      {e:'Check in',h:'כניסה למלון (צ׳ק-אין)',p:'צֶ׳ק אִין',x:'I would like to check in, please.'},
      {e:'Check out',h:'עזיבת המלון (צ׳ק-אאוט)',p:'צֶ׳ק אַאוּט',x:'I need to check out tomorrow morning.'},
    ]},
    {id:'shopping',he:'קניות',en:'Shopping',emoji:'🛒',words:[
      {e:'Do you have this in my size?',h:'יש לכם את זה במידה שלי?',p:'דוּ יוּ הֶב דִ׳יס אִין מַיי סַייז?',x:'Do you have this in my size?'},
      {e:'I am just looking',h:'אני רק מסתכל/ת',p:'אַיי אֶם גַ׳אסְט לוּקִינְג',x:'No thank you, I am just looking.'},
      {e:'Can I try this on?',h:'אפשר למדוד את זה?',p:'קֶן אַיי טְרַיי דִ׳יס אוֹן?',x:'Can I try this on, please?'},
      {e:'Do you accept credit cards?',h:'אתם מקבלים כרטיסי אשראי?',p:'דוּ יוּ אֶקְסֶפְּט קְרֶדִיט קַארְדְס?',x:'Do you accept credit cards?'},
      {e:'I will take it',h:'אני אקח את זה',p:'אַיי וִויל טֵייק אִיט',x:'Perfect, I will take it!'},
      {e:'Can I get a receipt?',h:'אפשר לקבל קבלה?',p:'קֶן אַיי גֶט אֶה רִיסִיט?',x:'Can I get a receipt, please?'},
      {e:'Is there a discount?',h:'יש הנחה?',p:'אִיז דֶ׳ר אֶה דִיסְקַאוּנְט?',x:'Excuse me, is there a discount?'},
      {e:'Too expensive',h:'יקר מדי',p:'טוּ אֶקְסְפֶּנְסִיב',x:'That is too expensive for me.'},
    ]},
    {id:'feelings',he:'רגשות',en:'Feelings',emoji:'😊',words:[
      {e:'I am happy',h:'אני שמח/ה',p:'אַיי אֶם הֶפִּי',x:'I am very happy to be here!'},
      {e:'I am tired',h:'אני עייף/ה',p:'אַיי אֶם טַייֶרְד',x:'Sorry, I am really tired today.'},
      {e:'I am hungry',h:'אני רעב/ה',p:'אַיי אֶם הַאנְגְרִי',x:'I am very hungry. Let us eat!'},
      {e:'I am lost',h:'הלכתי לאיבוד',p:'אַיי אֶם לוֹסְט',x:'I am lost. Can you help me?'},
      {e:'I am excited',h:'אני נרגש/ת',p:'אַיי אֶם אֶקְסַייטֶד',x:'I am so excited about this trip!'},
      {e:'I miss you',h:'אני מתגעגע/ת אליך',p:'אַיי מִיס יוּ',x:'I miss you so much!'},
      {e:'I love it',h:'אני אוהב/ת את זה',p:'אַיי לַאב אִיט',x:'This food is amazing, I love it!'},
      {e:'I am not feeling well',h:'אני לא מרגיש/ה טוב',p:'אַיי אֶם נוֹט פִילִינְג וֶול',x:'Sorry, I am not feeling well today.'},
    ]},
    {id:'health',he:'בריאות',en:'Health',emoji:'🏥',words:[
      {e:'I need a doctor',h:'אני צריך/ה רופא',p:'אַיי נִיד אֶה דוֹקְטֶר',x:'Please, I need a doctor now!'},
      {e:'I have a headache',h:'יש לי כאב ראש',p:'אַיי הֶב אֶה הֶדֵייק',x:'I have a terrible headache.'},
      {e:'I am allergic to',h:'אני אלרגי/ת ל...',p:'אַיי אֶם אֶלֶרְגִ׳יק טוּ',x:'I am allergic to nuts.'},
      {e:'Call an ambulance',h:'תזמינו אמבולנס',p:'קוֹל אֶן אֶמְבְּיוּלֶנְס',x:'Please call an ambulance!'},
      {e:'Where is the pharmacy?',h:'איפה בית המרקחת?',p:'ווֶר אִיז דֶ׳ה פַארְמֶסִי?',x:'Where is the nearest pharmacy?'},
      {e:'I take medication',h:'אני לוקח/ת תרופות',p:'אַיי טֵייק מֶדִיקֵיישֶן',x:'I take medication every morning.'},
      {e:'I need a prescription',h:'אני צריך/ה מרשם',p:'אַיי נִיד אֶה פְּרֶסְקְרִיפְּשֶן',x:'I need a prescription for this medicine.'},
      {e:'I feel better',h:'אני מרגיש/ה יותר טוב',p:'אַיי פִיל בֶּטֶר',x:'Thank you, I feel much better now.'},
    ]},
  ],
  advanced:[
    {id:'idioms',he:'ניבים',en:'Common Idioms',emoji:'💬',words:[
      {e:'Break a leg',h:'בהצלחה!',p:'בְּרֵייק אֶה לֶג',x:'Break a leg at your interview!'},
      {e:'It is a piece of cake',h:'זה קלי קלות',p:'אִיט אִיז אֶה פִּיס אוֹב קֵייק',x:'Do not worry, it is a piece of cake!'},
      {e:'Under the weather',h:'לא מרגיש/ה טוב',p:'אַנְדֶר דֶ׳ה וֶדֶ׳ר',x:'I am feeling a bit under the weather.'},
      {e:'Hit the road',h:'לצאת לדרך',p:'הִיט דֶ׳ה רוֹד',x:'Let us hit the road before traffic.'},
      {e:'Cost an arm and a leg',h:'לעלות הון',p:'קוֹסְט אֶן אַרְם אֶנְד אֶה לֶג',x:'This hotel cost an arm and a leg!'},
      {e:'The more the merrier',h:'כמה שיותר – יותר שמח',p:'דֶ׳ה מוֹר דֶ׳ה מֶרִיאֶר',x:'Bring your friends! The more the merrier.'},
      {e:'Once in a blue moon',h:'לעיתים נדירות',p:'וַואנְס אִין אֶה בְּלוּ מוּן',x:'We eat out once in a blue moon.'},
      {e:'No pain, no gain',h:'בלי מאמץ אין הצלחה',p:'נוֹ פֵּיין, נוֹ גֵיין',x:'Keep training! No pain, no gain.'},
    ]},
    {id:'business',he:'עסקים',en:'Business Talk',emoji:'💼',words:[
      {e:'Let us touch base',h:'בוא נתעדכן',p:'לֶט אַס טַאץ׳ בֵּייס',x:'Let us touch base next week.'},
      {e:'I will follow up',h:'אני אעדכן אותך בהמשך',p:'אַיי וִויל פוֹלוֹ אַפּ',x:'I will follow up with you by email.'},
      {e:'What is the deadline?',h:'מה המועד האחרון?',p:'ווֹט אִיז דֶ׳ה דֶדְלַיין?',x:'What is the deadline for this project?'},
      {e:'Let us get the ball rolling',h:'בוא נתחיל לעבוד',p:'לֶט אַס גֶט דֶ׳ה בּוֹל רוֹלִינְג',x:'Let us get the ball rolling on this deal.'},
      {e:'I will get back to you',h:'אני אחזור אליך',p:'אַיי וִויל גֶט בֶּק טוּ יוּ',x:'I will get back to you after the meeting.'},
      {e:'Can we schedule a call?',h:'אפשר לקבוע שיחה?',p:'קֶן וִוי סְקֶג׳וּל אֶה קוֹל?',x:'Can we schedule a call for Monday?'},
      {e:'To be honest with you',h:'אם לדבר בכנות',p:'טוּ בִּי אוֹנֶסְט וִוית׳ יוּ',x:'To be honest with you, I need more time.'},
      {e:'That works for me',h:'זה מתאים לי',p:'דֶ׳ט ווֹרְקְס פוֹר מִי',x:'Monday at three? That works for me.'},
    ]},
    {id:'smalltalk',he:'שיחה קלה',en:'Small Talk',emoji:'🌍',words:[
      {e:'How have you been?',h:'מה שלומך בזמן האחרון?',p:'הַאוּ הֶב יוּ בִּין?',x:'Long time no see! How have you been?'},
      {e:'Not too bad',h:'לא רע',p:'נוֹט טוּ בֶּד',x:'How are you? Not too bad, thanks!'},
      {e:'What do you do for a living?',h:'מה העבודה שלך?',p:'ווֹט דוּ יוּ דוּ פוֹר אֶה לִיבִינְג?',x:'So, what do you do for a living?'},
      {e:'I know what you mean',h:'אני מבין/ה למה הכוונה',p:'אַיי נוֹ ווֹט יוּ מִין',x:'Yes, I know exactly what you mean.'},
      {e:'Tell me about yourself',h:'ספר/י לי על עצמך',p:'טֶל מִי אֶבַּאוּט יוֹרְסֶלְף',x:'Nice to meet you! Tell me about yourself.'},
      {e:'What do you think?',h:'מה דעתך?',p:'ווֹט דוּ יוּ תִ׳ינְק?',x:'That is interesting. What do you think?'},
      {e:'I totally agree',h:'אני מסכים/ה לגמרי',p:'אַיי טוֹטֶלִי אֶגְרִי',x:'I totally agree with you on that!'},
      {e:'That is a good point',h:'זו נקודה טובה',p:'דֶ׳ט אִיז אֶה גוּד פּוֹיְנְט',x:'That is a really good point, actually.'},
    ]},
    {id:'conditionals',he:'משפטי תנאי',en:'Conditionals',emoji:'🔀',words:[
      {e:'If I were you',h:'אם הייתי במקומך',p:'אִיף אַיי ווֶר יוּ',x:'If I were you, I would take the job.'},
      {e:'I wish I could',h:'הלוואי שיכולתי',p:'אַיי וִויש אַיי קוּד',x:'I wish I could come to your party!'},
      {e:'What would you do if',h:'מה היית עושה אם',p:'ווֹט ווּד יוּ דוּ אִיף',x:'What would you do if you won the lottery?'},
      {e:'As long as',h:'כל עוד',p:'אֶז לוֹנְג אֶז',x:'I will help you as long as you try.'},
      {e:'Even though',h:'למרות ש...',p:'אִיבֶן ד׳וֹ',x:'I loved it even though it was hard.'},
      {e:'I should have',h:'הייתי צריך/ה',p:'אַיי שׁוּד הֶב',x:'I should have called you earlier. Sorry!'},
      {e:'It depends on',h:'זה תלוי ב...',p:'אִיט דִיפֶּנְדְז אוֹן',x:'It depends on the weather, really.'},
      {e:'In that case',h:'במקרה כזה',p:'אִין דֶ׳ט קֵייס',x:'Oh, in that case let us change the plan.'},
    ]},
    {id:'writing',he:'ביטויי קישור',en:'Linking Phrases',emoji:'🔗',words:[
      {e:'On the other hand',h:'מצד שני',p:'אוֹן דִ׳י אַדֶ׳ר הֶנְד',x:'On the other hand, there are benefits.'},
      {e:'As a matter of fact',h:'למעשה',p:'אֶז אֶה מֶטֶר אוֹב פֶקְט',x:'As a matter of fact, I agree with you.'},
      {e:'To be fair',h:'למען ההגינות',p:'טוּ בִּי פֶר',x:'To be fair, she did warn us.'},
      {e:'Having said that',h:'יחד עם זאת',p:'הֶבִינְג סֶד דֶ׳ט',x:'Having said that, let us try again.'},
      {e:'At the end of the day',h:'בסופו של דבר',p:'אֶט דִ׳י אֶנְד אוֹב דֶ׳ה דֵיי',x:'At the end of the day, what matters is family.'},
      {e:'For what it is worth',h:'אם זה עוזר במשהו',p:'פוֹר ווֹט אִיט אִיז ווֹרְת׳',x:'For what it is worth, I think you are right.'},
      {e:'All things considered',h:'בסך הכול',p:'אוֹל תִ׳ינְגְז קוֹנְסִידֶרְד',x:'All things considered, it went well.'},
      {e:'More often than not',h:'ברוב המקרים',p:'מוֹר אוֹפֶן דֶ׳ן נוֹט',x:'More often than not, he arrives late.'},
    ]},
  ],
};

// Per-user personal phrases, keyed by the lesson they are added to.
// Each one becomes the FIRST flashcard of that lesson for that user.
const PERSONAL_WORDS={
  verbs:{
    shlomo:{e:'We are great friends',h:'אנחנו חברים טובים',p:'וִוי אַר גְרֵייט פְרֶנְדְז',x:'You and I, we are great friends.'},
    shira: {e:'We will be very successful',h:'אנחנו נצליח מאוד',p:'וִוי וִויל בִּי וֶרִי סַקְסֶסְפוּל',x:'Believe it — we will be very successful.'},
    sara:  {e:'We will get married',h:'אנחנו נתחתן',p:'וִוי וִויל גֶט מֶרִיד',x:'One day, we will get married.'},
  },
  feelings:{
    shlomo:{e:'I love winning',h:'אני אוהב לנצח',p:'אַיי לַאב וִוינִינְג',x:'I love winning at everything I do!'},
    shira: {e:'I love dancing',h:'אני אוהבת לרקוד',p:'אַיי לַאב דֶנְסִינְג',x:'I love dancing more than anything!'},
    sara:  {e:'I love you',h:'אני אוהבת אותך',p:'אַיי לַאב יוּ',x:'I love you with all my heart.'},
  },
};
function lessonsFor(uid,level){
  return LESSONS[level].map(l=>{
    const extra=PERSONAL_WORDS[l.id]&&PERSONAL_WORDS[l.id][uid];
    return extra?{...l,words:[extra,...l.words]}:l;
  });
}
