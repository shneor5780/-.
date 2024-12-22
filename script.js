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

// משתנים גלובליים
let currentUser = null;
let userSettings = {
    theme: 'light',
    fontSize: 'medium',
    notifyExpenses: true,
    notifyGoals: true
};

// פונקציות אימות
function initAuth() {
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
                showNotification('שגיאת התחברות: ' + error.message, 'error');
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
                showNotification('נרשמת בהצלחה!', 'success');
            } catch (error) {
                showNotification('שגיאת הרשמה: ' + error.message, 'error');
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
                showNotification('שגיאת התחברות עם Google: ' + error.message, 'error');
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
            loadUserSettings();
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
        if (data.expenses) localStorage.setItem('expenses', JSON.stringify(data.expenses));
        if (data.incomes) localStorage.setItem('incomes', JSON.stringify(data.incomes));
        if (data.budgets) localStorage.setItem('budgets', JSON.stringify(data.budgets));
        if (data.goals) localStorage.setItem('goals', JSON.stringify(data.goals));
    }
    
    updateDisplay();
}

async function saveUserData() {
    if (!currentUser) return;
    
    const db = firebase.firestore();
    await db.collection('users').doc(currentUser.uid).set({
        expenses: getExpenses(),
        incomes: getIncomes(),
        budgets: getBudgets(),
        goals: getGoals()
    });
}

async function loadUserSettings() {
    if (!currentUser) return;
    
    const db = firebase.firestore();
    const settingsDoc = await db.collection('userSettings').doc(currentUser.uid).get();
    
    if (settingsDoc.exists) {
        userSettings = { ...userSettings, ...settingsDoc.data() };
        applySettings();
    }
}

async function saveUserSettings() {
    if (!currentUser) return;
    
    const db = firebase.firestore();
    await db.collection('userSettings').doc(currentUser.uid).set(userSettings);
}

// פונקציות הגדרות
function applySettings() {
    // ערכת נושא
    if (userSettings.theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // גודל טקסט
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.body.classList.add(`font-size-${userSettings.fontSize}`);
    
    // עדכון טופס הגדרות
    document.getElementById('settingsTheme').value = userSettings.theme;
    document.getElementById('settingsFontSize').value = userSettings.fontSize;
    document.getElementById('settingsNotifyExpenses').checked = userSettings.notifyExpenses;
    document.getElementById('settingsNotifyGoals').checked = userSettings.notifyGoals;
}

function setupSettings() {
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            userSettings = {
                theme: document.getElementById('settingsTheme').value,
                fontSize: document.getElementById('settingsFontSize').value,
                notifyExpenses: document.getElementById('settingsNotifyExpenses').checked,
                notifyGoals: document.getElementById('settingsNotifyGoals').checked
            };
            
            await saveUserSettings();
            applySettings();
            document.getElementById('settingsModal').classList.add('hidden');
            showNotification('ההגדרות נשמרו בהצלחה', 'success');
        });
    }
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

function getGoals() {
    return JSON.parse(localStorage.getItem('goals') || '[]');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg text-white ${
        type === 'error' ? 'bg-red-500' : 
        type === 'success' ? 'bg-green-500' : 
        'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}// פונקציות לשוניות
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // הסרת הפעיל מכל הלשוניות
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // הוספת פעיל ללשונית הנבחרת
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// פונקציות מטרות
async function addGoal(e) {
    e.preventDefault();
    
    const goal = {
        name: document.getElementById('goalName').value,
        amount: Number(document.getElementById('goalAmount').value),
        date: document.getElementById('goalDate').value,
        description: document.getElementById('goalDescription').value,
        currentAmount: 0
    };
    
    const goals = getGoals();
    goals.push(goal);
    localStorage.setItem('goals', JSON.stringify(goals));
    await saveUserData();
    
    e.target.reset();
    updateGoalsList();
    showNotification('המטרה נוספה בהצלחה', 'success');
}

async function updateGoalAmount(index, amount) {
    const goals = getGoals();
    goals[index].currentAmount += Number(amount);
    localStorage.setItem('goals', JSON.stringify(goals));
    await saveUserData();
    updateGoalsList();
}

async function deleteGoal(index) {
    if (!confirm('האם אתה בטוח שברצונך למחוק מטרה זו?')) return;
    
    const goals = getGoals();
    goals.splice(index, 1);
    localStorage.setItem('goals', JSON.stringify(goals));
    await saveUserData();
    updateGoalsList();
    showNotification('המטרה נמחקה בהצלחה', 'success');
}

function updateGoalsList() {
    const goalsList = document.getElementById('goalsList');
    if (!goalsList) return;
    
    const goals = getGoals();
    goalsList.innerHTML = '';
    
    goals.forEach((goal, index) => {
        const progress = (goal.currentAmount / goal.amount) * 100;
        const daysLeft = Math.ceil((new Date(goal.date) - new Date()) / (1000 * 60 * 60 * 24));
        const monthlyNeeded = (goal.amount - goal.currentAmount) / (daysLeft / 30);
        
        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card';
        goalCard.innerHTML = `
            <h4 class="font-bold">${goal.name}</h4>
            <p class="text-sm text-gray-600">${goal.description}</p>
            <div class="goal-progress">
                <div class="goal-progress-bar" style="width: ${progress}%"></div>
            </div>
            <p class="text-sm">${goal.currentAmount.toLocaleString()} ₪ מתוך ${goal.amount.toLocaleString()} ₪</p>
            <p class="text-sm">נותרו ${daysLeft} ימים</p>
            <p class="text-sm">נדרש לחסוך: ${monthlyNeeded.toLocaleString()} ₪ בחודש</p>
            <div class="mt-4 space-x-2 space-x-reverse">
                <button onclick="updateGoalAmount(${index}, prompt('הכנס סכום להוספה:'))" 
                        class="bg-green-500 text-white px-2 py-1 rounded text-sm">
                    הוסף סכום
                </button>
                <button onclick="deleteGoal(${index})" 
                        class="bg-red-500 text-white px-2 py-1 rounded text-sm">
                    מחק
                </button>
            </div>
        `;
        goalsList.appendChild(goalCard);
    });
}

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    setupTabs();
    
    // טפסים
    const forms = {
        expense: document.getElementById('expenseForm'),
        income: document.getElementById('incomeForm'),
        goal: document.getElementById('goalForm')
    };
    
    if (forms.expense) forms.expense.addEventListener('submit', addExpense);
    if (forms.income) forms.income.addEventListener('submit', addIncome);
    if (forms.goal) forms.goal.addEventListener('submit', addGoal);
    
    // עדכון קטגוריות
    const expenseType = document.getElementById('expenseType');
    if (expenseType) {
        updateCategories('הוצאות קבועות');
        expenseType.addEventListener('change', (e) => updateCategories(e.target.value));
    }
    
    // סיכום
    const summaryType = document.getElementById('summaryType');
    if (summaryType) summaryType.addEventListener('change', updateDisplay);
    
    // הגדרות
    setupSettings();
    
    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => console.log('Service Worker registered'))
            .catch(error => console.log('Service Worker registration failed:', error));
    }
});
