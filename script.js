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

// פונקציות עזר
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
}

// פונקציות אימות
function initAuth() {
    const container = document.querySelector('.container');
    const authModal = document.getElementById('authModal');
    
    if (container) container.style.display = 'none';
    if (authModal) authModal.style.display = 'flex';
    
    // טופס התחברות
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            
            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                showNotification('התחברת בהצלחה!', 'success');
            } catch (error) {
                showNotification('שגיאת התחברות: ' + error.message, 'error');
            }
        });
    }    // כפתור הרשמה
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
            showNotification('התנתקת בהצלחה', 'success');
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
}

// פונקציות Firestore
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
    updateGoalsList();
}

async function saveUserData() {
    if (!currentUser) return;
    
    const db = firebase.firestore();
    await db.collection('users').doc(currentUser.uid).set({
        expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
        incomes: JSON.parse(localStorage.getItem('incomes') || '[]'),
        budgets: JSON.parse(localStorage.getItem('budgets') || '{"fixedBudget":0,"variableBudget":0}'),
        goals: JSON.parse(localStorage.getItem('goals') || '[]')
    });
}// פונקציות הגדרות
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
}

function setupSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const settingsForm = document.getElementById('settingsForm');

    // פתיחת מודל ההגדרות
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });
    }
    
    // סגירת מודל ההגדרות
    if (closeSettings && settingsModal) {
        closeSettings.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }
    
    // שמירת הגדרות
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
            settingsModal.classList.add('hidden');
            showNotification('ההגדרות נשמרו בהצלחה', 'success');
        });
    }
}

// פונקציות עדכון תצוגה
function updateCategories(type) {
    const categorySelect = document.getElementById('expenseCategory');
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '';
    categories[type].forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}// פונקציות הוצאות והכנסות
function updateDisplay() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const incomes = JSON.parse(localStorage.getItem('incomes') || '[]');
    
    // עדכון טבלת הוצאות
    const expensesList = document.getElementById('expensesList');
    if (expensesList) {
        expensesList.innerHTML = '';
        expenses.forEach((expense, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="border p-2">${expense.date}</td>
                <td class="border p-2">${expense.type}</td>
                <td class="border p-2">${expense.category}</td>
                <td class="border p-2">${expense.amount.toLocaleString()} ₪</td>
                <td class="border p-2">${expense.description || ''}</td>
                <td class="border p-2">
                    <button onclick="deleteExpense(${index})" class="bg-red-500 text-white px-2 py-1 rounded">
                        מחק
                    </button>
                </td>
            `;
            expensesList.appendChild(row);
        });
    }
    
    // עדכון טבלת הכנסות
    const incomesList = document.getElementById('incomesList');
    if (incomesList) {
        incomesList.innerHTML = '';
        incomes.forEach((income, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="border p-2">${income.date}</td>
                <td class="border p-2">${income.source}</td>
                <td class="border p-2">${income.amount.toLocaleString()} ₪</td>
                <td class="border p-2">${income.description || ''}</td>
                <td class="border p-2">
                    <button onclick="deleteIncome(${index})" class="bg-red-500 text-white px-2 py-1 rounded">
                        מחק
                    </button>
                </td>
            `;
            incomesList.appendChild(row);
        });
    }
    
    // עדכון סיכומים
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);
    const balance = totalIncomes - totalExpenses;
    
    const summaryElements = {
        totalExpenses: document.getElementById('totalExpenses'),
        totalIncomes: document.getElementById('totalIncomes'),
        balance: document.getElementById('balance')
    };
    
    if (summaryElements.totalExpenses) {
        summaryElements.totalExpenses.textContent = totalExpenses.toLocaleString() + ' ₪';
        summaryElements.totalExpenses.className = 'text-red-500 font-bold';
    }
    
    if (summaryElements.totalIncomes) {
        summaryElements.totalIncomes.textContent = totalIncomes.toLocaleString() + ' ₪';
        summaryElements.totalIncomes.className = 'text-green-500 font-bold';
    }
    
    if (summaryElements.balance) {
        summaryElements.balance.textContent = balance.toLocaleString() + ' ₪';
        summaryElements.balance.className = balance >= 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold';
    }
}// פונקציות הוספה ומחיקה
function addExpense(e) {
    e.preventDefault();
    
    const expense = {
        type: document.getElementById('expenseType').value,
        category: document.getElementById('expenseCategory').value,
        amount: Number(document.getElementById('expenseAmount').value),
        date: document.getElementById('expenseDate').value,
        description: document.getElementById('expenseDescription').value
    };

    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    saveUserData();
    updateDisplay();
    e.target.reset();
    showNotification('ההוצאה נוספה בהצלחה', 'success');
}

function addIncome(e) {
    e.preventDefault();
    
    const income = {
        source: document.getElementById('incomeSource').value,
        amount: Number(document.getElementById('incomeAmount').value),
        date: document.getElementById('incomeDate').value,
        description: document.getElementById('incomeDescription').value
    };

    const incomes = JSON.parse(localStorage.getItem('incomes') || '[]');
    incomes.push(income);
    localStorage.setItem('incomes', JSON.stringify(incomes));
    
    saveUserData();
    updateDisplay();
    e.target.reset();
    showNotification('ההכנסה נוספה בהצלחה', 'success');
}

function deleteExpense(index) {
    if (!confirm('האם אתה בטוח שברצונך למחוק הוצאה זו?')) return;
    
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    saveUserData();
    updateDisplay();
    showNotification('ההוצאה נמחקה בהצלחה', 'success');
}

function deleteIncome(index) {
    if (!confirm('האם אתה בטוח שברצונך למחוק הכנסה זו?')) return;
    
    const incomes = JSON.parse(localStorage.getItem('incomes') || '[]');
    incomes.splice(index, 1);
    localStorage.setItem('incomes', JSON.stringify(incomes));
    
    saveUserData();
    updateDisplay();
    showNotification('ההכנסה נמחקה בהצלחה', 'success');
}

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    setupSettings();
    
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
});
