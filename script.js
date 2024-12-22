// קטגוריות
const CATEGORIES = {
    'הוצאות קבועות': [
        'שכירות/משכנתא',
        'מיסי יישוב',
        'ארנונה',
        'חשמל',
        'מים',
        'גז',
        'ועד בית',
        'אינטרנט/טלוויזיה',
        'ביטוחים',
        'חינוך'
    ],
    'הוצאות משתנות': [
        'מזון וסופר',
        'תחבורה/דלק',
        'קניות',
        'בילויים',
        'בריאות',
        'ביגוד',
        'מתנות',
        'אחר'
    ]
};

// תרגומים
const translations = {
    he: {
        title: 'ניהול תקציב משפחתי',
        addExpense: 'הוספת הוצאה',
        settings: 'הגדרות',
        logout: 'התנתק',
        login: 'התחבר',
        // ... יתר התרגומים בעברית
    },
    en: {
        title: 'Family Budget Management',
        addExpense: 'Add Expense',
        settings: 'Settings',
        logout: 'Logout',
        login: 'Login',
        // ... יתר התרגומים באנגלית
    }
};

// Firebase config
const firebaseConfig = {
    // הוסף כאן את פרטי התצורה שלך מ-Firebase
};

// אתחול Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// משתני מערכת
const settingsModal = document.getElementById('settingsModal');
let userSettings = loadSettings();
let currentUser = null;

// אתחול המערכת
document.addEventListener('DOMContentLoaded', () => {
    // מאזיני אירועים להגדרות
    document.getElementById('settingsBtn').addEventListener('click', () => settingsModal.classList.remove('hidden'));
    document.getElementById('closeSettings').addEventListener('click', () => settingsModal.classList.add('hidden'));
    document.getElementById('settingsForm').addEventListener('submit', handleSettingsSave);

    // מאזיני אירועים להוצאות
    document.getElementById('expenseForm').addEventListener('submit', addExpense);
    document.getElementById('expenseType').addEventListener('change', updateCategories);
    document.getElementById('summaryType').addEventListener('change', updateDisplay);
    document.getElementById('fixedBudget').addEventListener('change', saveBudgets);
    document.getElementById('variableBudget').addEventListener('change', saveBudgets);

    // מאזיני אירועים לאימות
    document.getElementById('googleAuthBtn').addEventListener('click', signInWithGoogle);
    document.getElementById('emailAuthBtn').addEventListener('click', showEmailSignIn);
    document.getElementById('languageSelect').addEventListener('change', changeLanguage);

    // אתחול התצוגה
    setDefaultDate();
    updateCategories();
    applySettings();
    loadData();
    setupAuthStateListener();
});

// פונקציות אימות
function setupAuthStateListener() {
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        updateUIForAuth(user);
        if (user) {
            loadUserData();
        }
    });
}

async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
    } catch (error) {
        console.error('Google sign-in error:', error);
        alert('שגיאה בהתחברות עם Google');
    }
}

function showEmailSignIn() {
    // הוסף כאן את הלוגיקה להצגת טופס התחברות באמצעות אימייל
}

// פונקציות הגדרות
function loadSettings() {
    const defaultSettings = {
        name: 'משתמש',
        theme: 'light',
        defaultView: 'monthly',
        fontSize: 'medium',
        language: 'he'
    };
    const savedSettings = localStorage.getItem('userSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
}

function saveSettings(settings) {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    if (currentUser) {
        // שמירת ההגדרות ב-Firebase
        firebase.firestore().collection('users').doc(currentUser.uid)
            .set({ settings }, { merge: true });
    }
}

function applySettings() {
    document.getElementById('userName').textContent = userSettings.name;
    document.getElementById('settingsName').value = userSettings.name;
    document.getElementById('settingsTheme').value = userSettings.theme;
    document.getElementById('defaultView').value = userSettings.defaultView;
    document.getElementById('summaryType').value = userSettings.defaultView;
    document.getElementById('settingsFontSize').value = userSettings.fontSize;
    document.getElementById('languageSelect').value = userSettings.language;
   
    // החלת ערכת נושא
    document.body.classList.toggle('dark-theme', userSettings.theme === 'dark');
    
    // החלת גודל טקסט
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.body.classList.add(`font-size-${userSettings.fontSize}`);
    
    // החלת שפה
    changeLanguage(userSettings.language);
}

function handleSettingsSave(e) {
    e.preventDefault();
    userSettings = {
        name: document.getElementById('settingsName').value,
        theme: document.getElementById('settingsTheme').value,
        defaultView: document.getElementById('defaultView').value,
        fontSize: document.getElementById('settingsFontSize').value,
        language: document.getElementById('languageSelect').value
    };
    saveSettings(userSettings);
    applySettings();
    settingsModal.classList.add('hidden');
    updateDisplay();
}

// פונקציות שפה
function changeLanguage(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    document.dir = lang === 'he' ? 'rtl' : 'ltr';
}

// המשך הפונקציות הקיימות...
function loadData() {
    const expenses = getExpenses();
    const { fixedBudget, variableBudget } = getBudgets();
   
    document.getElementById('fixedBudget').value = fixedBudget;
    document.getElementById('variableBudget').value = variableBudget;
   
    updateDisplay();
}

// ... (כל שאר הפונקציות הקיימות נשארות ללא שינוי)

// פונקציות חדשות לסנכרון עם Firebase
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        const doc = await firebase.firestore().collection('users').doc(currentUser.uid).get();
        if (doc.exists) {
            const data = doc.data();
            if (data.settings) {
                userSettings = { ...userSettings, ...data.settings };
                applySettings();
            }
            if (data.expenses) {
                localStorage.setItem('expenses', JSON.stringify(data.expenses));
                updateDisplay();
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function updateUIForAuth(user) {
    const authButtons = document.getElementById('authButtons');
    const settingsBtn = document.getElementById('settingsBtn');
    
    if (user) {
        authButtons.innerHTML = `
            <button onclick="auth.signOut()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                התנתק
            </button>
        `;
        settingsBtn.classList.remove('hidden');
    } else {
        authButtons.innerHTML = `
            <button id="googleAuthBtn" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                התחבר עם Google
            </button>
            <button id="emailAuthBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                התחבר עם אימייל
            </button>
        `;
        settingsBtn.classList.add('hidden');
    }
}

// יצוא הפונקציות הדרושות
export {
    loadSettings,
    saveSettings,
    applySettings,
    handleSettingsSave,
    changeLanguage,
    signInWithGoogle,
    showEmailSignIn
};
