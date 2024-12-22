// קטגוריות הוצאות
const categories = {
    'הוצאות קבועות': [
        'שכירות/משכנתא',
        'חשמל',
        'מים',
        'גז',
        'ועד בית',
        'אינטרנט',
        'טלפון',
        'ביטוחים',
        'חינוך',
        'אחר'
    ],
    'הוצאות משתנות': [
        'מזון',
        'קניות',
        'בילויים',
        'תחבורה',
        'בריאות',
        'ביגוד',
        'מתנות',
        'אחר'
    ]
};

// אתחול Firebase Auth
let currentUser = null;

// פונקציות אימות
function initAuth() {
    // הסתרת התוכן הראשי עד להתחברות
    const container = document.querySelector('.container');
    const authModal = document.getElementById('authModal');
    
    if (container) container.style.display = 'none';
    if (authModal) authModal.style.display = 'flex';
    
    // אירועי טופס התחברות
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            
            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
            } catch (error) {
                alert('שגיאת התחברות: ' + error.message);
            }
        });
    }

    // כפתור הרשמה
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            
            try {
                await firebase.auth().createUserWithEmailAndPassword(email, password);
            } catch (error) {
                alert('שגיאת הרשמה: ' + error.message);
            }
        });
    }

    // התחברות עם Google
    const googleAuthBtn = document.getElementById('googleAuthBtn');
    if (googleAuthBtn) {
        googleAuthBtn.addEventListener('click', async () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            try {
                await firebase.auth().signInWithPopup(provider);
            } catch (error) {
                alert('שגיאת התחברות עם Google: ' + error.message);
            }
        });
    }

    // כפתור התנתקות
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            firebase.auth().signOut();
        });
    }

    // מעקב אחר שינויי התחברות
    firebase.auth().onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            if (authModal) authModal.style.display = 'none';
            if (container) container.style.display = 'block';
            const userNameElement = document.getElementById('userName');
            if (userNameElement) userNameElement.textContent = user.email;
            loadUserData();
        } else {
            if (authModal) authModal.style.display = 'flex';
            if (container) container.style.display = 'none';
        }
    });
}// פונקציות Firestore
async function loadUserData() {
    if (!currentUser) return;
    
    const db = firebase.firestore();
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    
    if (userDoc.exists) {
        const data = userDoc.data();
        if (data.expenses) {
            localStorage.setItem('expenses', JSON.stringify(data.expenses));
        }
        if (data.incomes) {
            localStorage.setItem('incomes', JSON.stringify(data.incomes));
        }
        if (data.budgets) {
            localStorage.setItem('budgets', JSON.stringify(data.budgets));
        }
    }
    
    updateDisplay();
}

async function saveUserData() {
    if (!currentUser) return;
    
    const db = firebase.firestore();
    await db.collection('users').doc(currentUser.uid).set({
        expenses: getExpenses(),
        incomes: getIncomes(),
        budgets: getBudgets()
    });
}

// פונקציות עזר
function getExpenses() {
    return JSON.parse(localStorage.getItem('expenses') || '[]');
}

function getIncomes() {
    return JSON.parse(localStorage.getItem('incomes') || '[]');
}

function getBudgets() {
    return JSON.parse(localStorage.getItem('budgets') || '{"fixedBudget":0,"variableBudget":0}');
}

// אתחול הדף
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initializeApp();
});

function initializeApp() {
    // אתחול קטגוריות
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        updateCategories('הוצאות קבועות');
    }

    // מאזינים לאירועים
    const expenseType = document.getElementById('expenseType');
    if (expenseType) {
        expenseType.addEventListener('change', (e) => {
            updateCategories(e.target.value);
        });
    }

    const forms = {
        expense: document.getElementById('expenseForm'),
        income: document.getElementById('incomeForm')
    };

    if (forms.expense) forms.expense.addEventListener('submit', addExpense);
    if (forms.income) forms.income.addEventListener('submit', addIncome);

    const summaryType = document.getElementById('summaryType');
    if (summaryType) summaryType.addEventListener('change', updateDisplay);

    const budgetInputs = {
        fixed: document.getElementById('fixedBudget'),
        variable: document.getElementById('variableBudget')
    };

    if (budgetInputs.fixed) budgetInputs.fixed.addEventListener('change', updateBudgets);
    if (budgetInputs.variable) budgetInputs.variable.addEventListener('change', updateBudgets);
    
    // הגדרות
    setupSettings();

    // טעינת נתונים קיימים
    const budgets = getBudgets();
    if (budgetInputs.fixed) budgetInputs.fixed.value = budgets.fixedBudget || '';
    if (budgetInputs.variable) budgetInputs.variable.value = budgets.variableBudget || '';
    
    updateDisplay();
}

function setupSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const settingsForm = document.getElementById('settingsForm');

    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });
    }
    
    if (closeSettings && settingsModal) {
        closeSettings.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }
    
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const theme = document.getElementById('settingsTheme').value;
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            if (settingsModal) settingsModal.classList.add('hidden');
        });
    }
}
