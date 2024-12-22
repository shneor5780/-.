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
    layout: 'tabs',
    notifyExpenses: true,
    notifyGoals: true
};

// פונקציות עזר
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${
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
}

// פונקציות הגדרות
async function loadUserSettings() {
    if (!currentUser) return;
    
    const db = firebase.firestore();
    const settingsDoc = await db.collection('userSettings').doc(currentUser.uid).get();
    
    if (settingsDoc.exists) {
        userSettings = { ...userSettings, ...settingsDoc.data() };
        applySettings();
    }
}async function saveUserSettings() {
    if (!currentUser) return;
    
    const db = firebase.firestore();
    await db.collection('userSettings').doc(currentUser.uid).set(userSettings);
}

function applySettings() {
    // ערכת נושא
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${userSettings.theme}-theme`);
    
    // גודל טקסט
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.body.classList.add(`font-size-${userSettings.fontSize}`);
    
    // לייאאוט
    const container = document.querySelector('.container');
    if (container) {
        if (userSettings.layout === 'scroll') {
            container.classList.add('scroll-layout');
            container.classList.remove('tabs-layout');
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('hidden');
            });
        } else {
            container.classList.remove('scroll-layout');
            container.classList.add('tabs-layout');
            setupTabs();
        }
    }
}

function setupSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const settingsForm = document.getElementById('settingsForm');

    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => {
            const themeSelect = document.getElementById('settingsTheme');
            const fontSelect = document.getElementById('settingsFontSize');
            const layoutSelect = document.getElementById('settingsLayout');
            const notifyExpenses = document.getElementById('settingsNotifyExpenses');
            const notifyGoals = document.getElementById('settingsNotifyGoals');

            if (themeSelect) themeSelect.value = userSettings.theme;
            if (fontSelect) fontSelect.value = userSettings.fontSize;
            if (layoutSelect) layoutSelect.value = userSettings.layout;
            if (notifyExpenses) notifyExpenses.checked = userSettings.notifyExpenses;
            if (notifyGoals) notifyGoals.checked = userSettings.notifyGoals;
            
            settingsModal.classList.remove('hidden');
        });
    }
    
    if (closeSettings && settingsModal) {
        closeSettings.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }
    
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newSettings = {
                theme: document.getElementById('settingsTheme').value,
                fontSize: document.getElementById('settingsFontSize').value,
                layout: document.getElementById('settingsLayout').value,
                notifyExpenses: document.getElementById('settingsNotifyExpenses')?.checked || false,
                notifyGoals: document.getElementById('settingsNotifyGoals')?.checked || false
            };
            
            userSettings = newSettings;
            await saveUserSettings();
            applySettings();
            
            settingsModal.classList.add('hidden');
            showNotification('ההגדרות נשמרו בהצלחה', 'success');
        });
    }
}

// פונקציית ניווט בלשוניות
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active', 'bg-blue-500', 'text-white'));
            tabContents.forEach(c => c.classList.add('hidden'));
            
            btn.classList.add('active', 'bg-blue-500', 'text-white');
            const tabId = btn.dataset.tab;
            const selectedTab = document.getElementById(tabId);
            if (selectedTab) {
                selectedTab.classList.remove('hidden');
            }
        });
    });

    // הפעלת הלשונית הראשונה כברירת מחדל
    if (tabBtns.length > 0) {
        tabBtns[0].click();
    }
}

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    setupSettings();
    
    const expenseType = document.getElementById('expenseType');
    if (expenseType) {
        updateCategories('הוצאות קבועות');
        expenseType.addEventListener('change', (e) => updateCategories(e.target.value));
    }
});
