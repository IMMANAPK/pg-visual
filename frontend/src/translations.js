const translations = {
  english: {
    // Header
    tagline: "Learn PostgreSQL visually — built for frontend devs",
    database: "pgvisual database",

    // Schema Viewer
    schema: "Schema",
    selectFrom: "SELECT * FROM",

    // Query History
    history: "History",
    clear: "Clear",
    noQueriesYet: "No queries yet",
    rows: "rows",

    // Query Suggest
    askInPlainEnglish: "Ask in Plain English",
    askPlaceholder: "e.g., Show all published posts with views > 500",
    showAllUsers: "Show all users",
    postsWithMostViews: "Posts with most views",
    commentsByEachUser: "Comments by each user",
    postsWithTags: "Posts with their tags",

    // Playground
    sqlPlayground: "SQL Playground",
    ctrlEnterToRun: "Ctrl + Enter to run",
    runQuery: "Run Query",
    running: "Running...",
    allUsers: "All Users",
    topPosts: "Top Posts",
    postCount: "Post Count",
    postsTags: "Posts + Tags",
    statsByStatus: "Stats by Status",

    // Results
    results: "Results",
    noRowsReturned: "No rows returned",
    runQueryToSeeResults: "Run a query to see results",
    queryError: "Query Error",

    // AI Explainer
    aiExplanation: "AI Explanation",
    analyzingQuery: "Analyzing your query...",
    runQueryForExplanation: "Run a query to get an AI explanation",
    aiHint: "I'll explain SQL in terms you know — like comparing JOINs to array methods!",
    explainAgain: "Explain Again",

    // Agents
    agents: "AI Agents",
    tutorAgent: "Tutor",
    optimizerAgent: "Optimizer",
    debugAgent: "Debug",
    quizAgent: "Quiz",
    tutorDescription: "Run a query to get AI explanation",
    optimizerDescription: "Analyze your query for performance improvements",
    debugDescription: "Get help fixing SQL errors",
    noQueryToAnalyze: "Write a query first to analyze",
    noErrorToDebug: "No error to debug - your query is working!",
    analyzeQuery: "Analyze Query",
    analyzing: "Analyzing...",
    currentError: "Current Error",
    noErrors: "No errors - looking good!",
    fixError: "Fix This Error",
    debugging: "Debugging...",

    // Quiz
    score: "Score",
    difficulty: "Difficulty",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    startQuiz: "Start Quiz",
    loadingQuiz: "Loading question...",
    retry: "Retry",
    submitAnswer: "Submit Answer",
    correct: "Correct",
    incorrect: "Incorrect",
    explanation: "Explanation",
    nextQuestion: "Next Question",

    // Database Connection
    connectDb: "Connect DB",
    connectDatabase: "Connect Your Database",
    connectDescription: "Learn SQL with your own database or use our sample database",
    useSampleDb: "Sample Database",
    sampleDbDescription: "Use pgvisual demo database with users, posts, comments",
    connectCustomDb: "Your Database",
    customDbDescription: "Connect to your PostgreSQL database",
    connectionString: "Connection String",
    connectionHint: "Format: postgresql://user:password@host:port/database",
    connectionStringRequired: "Connection string is required",
    connectionFailed: "Failed to connect. Check your connection string.",
    connect: "Connect",
    connecting: "Connecting...",
    disconnect: "Disconnect",
    current: "Current",
    or: "OR",
    securityNote: "Your connection is secure. We only run SELECT queries."
  },

  thanglish: {
    // Header
    tagline: "PostgreSQL visually learn pannunga — frontend devs ku",
    database: "pgvisual database",

    // Schema Viewer
    schema: "Schema",
    selectFrom: "SELECT * FROM",

    // Query History
    history: "History",
    clear: "Clear pannu",
    noQueriesYet: "Queries onnum illa",
    rows: "rows",

    // Query Suggest
    askInPlainEnglish: "Ungal Language la Kelu",
    askPlaceholder: "e.g., Published posts ellam kaattu views > 500",
    showAllUsers: "Ellaa users kaattu",
    postsWithMostViews: "Athigam views ulla posts",
    commentsByEachUser: "Each user oda comments",
    postsWithTags: "Posts with tags",

    // Playground
    sqlPlayground: "SQL Playground",
    ctrlEnterToRun: "Ctrl + Enter run panna",
    runQuery: "Query Run Pannu",
    running: "Running...",
    allUsers: "Ellaa Users",
    topPosts: "Top Posts",
    postCount: "Post Count",
    postsTags: "Posts + Tags",
    statsByStatus: "Status Stats",

    // Results
    results: "Results",
    noRowsReturned: "Rows onnum illa 🤷",
    runQueryToSeeResults: "Query run pannu results paakka",
    queryError: "Query Error",

    // AI Explainer
    aiExplanation: "AI Explanation",
    analyzingQuery: "Ungal query analyze pannuren...",
    runQueryForExplanation: "AI explanation paakka query run pannunga",
    aiHint: "SQL-ah JavaScript maari explain pannuven — JOINs = array merge, WHERE = .filter() maari!",
    explainAgain: "Mendum Explain Pannu",

    // Agents
    agents: "AI Agents",
    tutorAgent: "Tutor",
    optimizerAgent: "Optimizer",
    debugAgent: "Debug",
    quizAgent: "Quiz",
    tutorDescription: "AI explanation paakka query run pannunga",
    optimizerDescription: "Ungal query-ah performance ku analyze pannum",
    debugDescription: "SQL errors fix panna help pannum",
    noQueryToAnalyze: "First query ezhuthunga analyze panna",
    noErrorToDebug: "Error illa - ungal query work aaguthu!",
    analyzeQuery: "Query Analyze Pannu",
    analyzing: "Analyzing...",
    currentError: "Current Error",
    noErrors: "Errors illa - super!",
    fixError: "Error Fix Pannu",
    debugging: "Debugging...",

    // Quiz
    score: "Score",
    difficulty: "Difficulty",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    startQuiz: "Quiz Start Pannu",
    loadingQuiz: "Question loading...",
    retry: "Retry",
    submitAnswer: "Answer Submit Pannu",
    correct: "Correct",
    incorrect: "Thappu",
    explanation: "Explanation",
    nextQuestion: "Next Question",

    // Database Connection
    connectDb: "DB Connect Pannu",
    connectDatabase: "Ungal Database Connect Pannunga",
    connectDescription: "Ungal own database la SQL learn pannunga or sample database use pannunga",
    useSampleDb: "Sample Database",
    sampleDbDescription: "pgvisual demo database - users, posts, comments",
    connectCustomDb: "Ungal Database",
    customDbDescription: "Ungal PostgreSQL database connect pannunga",
    connectionString: "Connection String",
    connectionHint: "Format: postgresql://user:password@host:port/database",
    connectionStringRequired: "Connection string venum",
    connectionFailed: "Connect aagala. Connection string check pannunga.",
    connect: "Connect Pannu",
    connecting: "Connecting...",
    disconnect: "Disconnect",
    current: "Current",
    or: "OR",
    securityNote: "Ungal connection secure. SELECT queries mattum run aagum."
  },

  tamil: {
    // Header
    tagline: "PostgreSQL-ஐ காட்சி வடிவில் கற்றுக்கொள்ளுங்கள்",
    database: "pgvisual தரவுத்தளம்",

    // Schema Viewer
    schema: "அமைப்பு",
    selectFrom: "SELECT * FROM",

    // Query History
    history: "வரலாறு",
    clear: "அழி",
    noQueriesYet: "வினவல்கள் எதுவும் இல்லை",
    rows: "வரிசைகள்",

    // Query Suggest
    askInPlainEnglish: "உங்கள் மொழியில் கேளுங்கள்",
    askPlaceholder: "எ.கா., எல்லா பயனர்களையும் காட்டு",
    showAllUsers: "எல்லா பயனர்கள்",
    postsWithMostViews: "அதிக பார்வைகள்",
    commentsByEachUser: "கருத்துகள்",
    postsWithTags: "குறிச்சொற்கள்",

    // Playground
    sqlPlayground: "SQL விளையாட்டுத்திடல்",
    ctrlEnterToRun: "Ctrl + Enter இயக்க",
    runQuery: "வினவலை இயக்கு",
    running: "இயங்குகிறது...",
    allUsers: "எல்லா பயனர்கள்",
    topPosts: "சிறந்த பதிவுகள்",
    postCount: "பதிவு எண்ணிக்கை",
    postsTags: "பதிவுகள் + குறிச்சொற்கள்",
    statsByStatus: "நிலை புள்ளிவிவரங்கள்",

    // Results
    results: "முடிவுகள்",
    noRowsReturned: "வரிசைகள் இல்லை 🤷",
    runQueryToSeeResults: "முடிவுகளைப் பார்க்க வினவலை இயக்கவும்",
    queryError: "வினவல் பிழை",

    // AI Explainer
    aiExplanation: "AI விளக்கம்",
    analyzingQuery: "உங்கள் வினவலை பகுப்பாய்வு செய்கிறேன்...",
    runQueryForExplanation: "AI விளக்கம் பெற வினவலை இயக்கவும்",
    aiHint: "SQL-ஐ JavaScript போல விளக்குவேன் — JOINs = array merge!",
    explainAgain: "மீண்டும் விளக்கு",

    // Agents
    agents: "AI முகவர்கள்",
    tutorAgent: "ஆசிரியர்",
    optimizerAgent: "மேம்படுத்தி",
    debugAgent: "பிழைநீக்கி",
    quizAgent: "வினாடி வினா",
    tutorDescription: "AI விளக்கம் பெற வினவலை இயக்கவும்",
    optimizerDescription: "செயல்திறனுக்காக உங்கள் வினவலை பகுப்பாய்வு செய்யும்",
    debugDescription: "SQL பிழைகளை சரிசெய்ய உதவும்",
    noQueryToAnalyze: "முதலில் வினவல் எழுதுங்கள்",
    noErrorToDebug: "பிழை இல்லை - உங்கள் வினவல் வேலை செய்கிறது!",
    analyzeQuery: "வினவலை பகுப்பாய்வு செய்",
    analyzing: "பகுப்பாய்வு செய்கிறேன்...",
    currentError: "தற்போதைய பிழை",
    noErrors: "பிழைகள் இல்லை - நல்லது!",
    fixError: "பிழையை சரிசெய்",
    debugging: "பிழைநீக்குகிறேன்...",

    // Quiz
    score: "மதிப்பெண்",
    difficulty: "கடினம்",
    beginner: "தொடக்க நிலை",
    intermediate: "இடைநிலை",
    advanced: "மேம்பட்ட",
    startQuiz: "வினாடி வினா தொடங்கு",
    loadingQuiz: "கேள்வி ஏற்றுகிறது...",
    retry: "மீண்டும் முயற்சி",
    submitAnswer: "பதில் சமர்ப்பி",
    correct: "சரி",
    incorrect: "தவறு",
    explanation: "விளக்கம்",
    nextQuestion: "அடுத்த கேள்வி",

    // Database Connection
    connectDb: "DB இணைப்பு",
    connectDatabase: "உங்கள் தரவுத்தளத்தை இணைக்கவும்",
    connectDescription: "உங்கள் சொந்த தரவுத்தளத்தில் SQL கற்றுக்கொள்ளுங்கள்",
    useSampleDb: "மாதிரி தரவுத்தளம்",
    sampleDbDescription: "pgvisual demo - users, posts, comments",
    connectCustomDb: "உங்கள் தரவுத்தளம்",
    customDbDescription: "உங்கள் PostgreSQL இணைக்கவும்",
    connectionString: "இணைப்பு சரம்",
    connectionHint: "Format: postgresql://user:password@host:port/database",
    connectionStringRequired: "இணைப்பு சரம் தேவை",
    connectionFailed: "இணைப்பு தோல்வி",
    connect: "இணைக்கவும்",
    connecting: "இணைக்கிறது...",
    disconnect: "துண்டிக்கவும்",
    current: "தற்போதைய",
    or: "அல்லது",
    securityNote: "உங்கள் இணைப்பு பாதுகாப்பானது. SELECT மட்டும்."
  },

  hindi: {
    // Header
    tagline: "PostgreSQL को विज़ुअली सीखें — फ्रंटएंड डेवलपर्स के लिए",
    database: "pgvisual डेटाबेस",

    // Schema Viewer
    schema: "स्कीमा",
    selectFrom: "SELECT * FROM",

    // Query History
    history: "इतिहास",
    clear: "साफ़ करें",
    noQueriesYet: "अभी तक कोई क्वेरी नहीं",
    rows: "पंक्तियाँ",

    // Query Suggest
    askInPlainEnglish: "अपनी भाषा में पूछें",
    askPlaceholder: "जैसे, सभी यूज़र्स दिखाओ",
    showAllUsers: "सभी यूज़र्स",
    postsWithMostViews: "सबसे ज़्यादा व्यूज़",
    commentsByEachUser: "कमेंट्स",
    postsWithTags: "टैग्स के साथ पोस्ट",

    // Playground
    sqlPlayground: "SQL प्लेग्राउंड",
    ctrlEnterToRun: "Ctrl + Enter चलाने के लिए",
    runQuery: "क्वेरी चलाएं",
    running: "चल रहा है...",
    allUsers: "सभी यूज़र्स",
    topPosts: "टॉप पोस्ट्स",
    postCount: "पोस्ट गिनती",
    postsTags: "पोस्ट्स + टैग्स",
    statsByStatus: "स्टेटस आँकड़े",

    // Results
    results: "परिणाम",
    noRowsReturned: "कोई पंक्ति नहीं मिली 🤷",
    runQueryToSeeResults: "परिणाम देखने के लिए क्वेरी चलाएं",
    queryError: "क्वेरी त्रुटि",

    // AI Explainer
    aiExplanation: "AI व्याख्या",
    analyzingQuery: "आपकी क्वेरी का विश्लेषण कर रहा हूँ...",
    runQueryForExplanation: "AI व्याख्या के लिए क्वेरी चलाएं",
    aiHint: "मैं SQL को JavaScript जैसे समझाऊंगा — JOINs = array merge!",
    explainAgain: "फिर से समझाएं",

    // Agents
    agents: "AI एजेंट्स",
    tutorAgent: "टीचर",
    optimizerAgent: "ऑप्टिमाइज़र",
    debugAgent: "डीबग",
    quizAgent: "क्विज़",
    tutorDescription: "AI व्याख्या के लिए क्वेरी चलाएं",
    optimizerDescription: "परफॉर्मेंस के लिए आपकी क्वेरी का विश्लेषण करेगा",
    debugDescription: "SQL त्रुटियों को ठीक करने में मदद करेगा",
    noQueryToAnalyze: "पहले क्वेरी लिखें",
    noErrorToDebug: "कोई त्रुटि नहीं - आपकी क्वेरी काम कर रही है!",
    analyzeQuery: "क्वेरी विश्लेषण करें",
    analyzing: "विश्लेषण कर रहा हूँ...",
    currentError: "वर्तमान त्रुटि",
    noErrors: "कोई त्रुटि नहीं - बढ़िया!",
    fixError: "त्रुटि ठीक करें",
    debugging: "डीबग कर रहा हूँ...",

    // Quiz
    score: "स्कोर",
    difficulty: "कठिनाई",
    beginner: "शुरुआती",
    intermediate: "मध्यम",
    advanced: "उन्नत",
    startQuiz: "क्विज़ शुरू करें",
    loadingQuiz: "प्रश्न लोड हो रहा है...",
    retry: "फिर से कोशिश",
    submitAnswer: "जवाब जमा करें",
    correct: "सही",
    incorrect: "गलत",
    explanation: "व्याख्या",
    nextQuestion: "अगला प्रश्न",

    // Database Connection
    connectDb: "DB कनेक्ट करें",
    connectDatabase: "अपना डेटाबेस कनेक्ट करें",
    connectDescription: "अपने डेटाबेस पर SQL सीखें या sample database इस्तेमाल करें",
    useSampleDb: "Sample Database",
    sampleDbDescription: "pgvisual demo - users, posts, comments",
    connectCustomDb: "आपका Database",
    customDbDescription: "अपना PostgreSQL कनेक्ट करें",
    connectionString: "Connection String",
    connectionHint: "Format: postgresql://user:password@host:port/database",
    connectionStringRequired: "Connection string ज़रूरी है",
    connectionFailed: "कनेक्ट नहीं हुआ। String चेक करें।",
    connect: "कनेक्ट करें",
    connecting: "कनेक्ट हो रहा है...",
    disconnect: "डिस्कनेक्ट",
    current: "वर्तमान",
    or: "या",
    securityNote: "आपका कनेक्शन सुरक्षित है। सिर्फ SELECT queries।"
  }
};

export default translations;
