// הגדרות Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBJtLGpP5-b8e3wAJ_QC_uJIFWCF2_eKhI",
    authDomain: "expense-tracker-5780.firebaseapp.com",
    projectId: "expense-tracker-5780",
    storageBucket: "expense-tracker-5780.appspot.com",
    messagingSenderId: "820518007437",
    appId: "1:820518007437:web:2f3b0e3f3b0e3f3b0e3f3b"
};

// אתחול Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// מצב המסכים
const loginScreen = document.getElementById('loginScreen');
const registerScreen = document.getElementById('registerScreen');
const mainApp = document.getElementById('mainApp');
const settingsModal = document.getElementById('settingsModal');

// משתני משתמש גלובליים
let currentUser = null;
let userSettings = null;

// הגדרת קטגוריות קבועות
const CATEGORIES = {
    'הוצאות קבועות': [
        'שכירות/משכנתא',
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

// אתחול המערכת
document.addEventListener('DOMContentLoaded', () => {
    // מאזיני אירועים עבור טפסים
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('settingsForm')?.addEventListener('submit', handleSettingsSave);
    document.getElementById('showRegister')?.addEventListener('click', () => toggleScreens('register'));
    document.getElementById('showLogin')?.addEventListener('click', () => toggleScreens('login'));
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('settingsBtn')?.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    document.getElementById('closeSettings')?.addEventListener('click', () => settingsModal.classList.add('hidden'));

    // מאזיני אירועים עבור האפליקציה
    document.getElementById('expenseForm')?.addEventListener('submit', addExpense);
    document.getElementById('expenseType')?.addEventListener('change', updateCategories);
    document.getElementById('fixedBudget')?.addEventListener('change', saveBudgets);
    document.getElementById('variableBudget')?.addEventListener('change', saveBudgets);

    // בדיקת מצב התחברות
    auth.onAuthStateChanged(handleAuthStateChanged);
});

// פונקציות אימות משתמשים
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        toggleScreens('main');
    } catch (error) {
        alert('שגיאה בהתחברות: ' + error.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        await saveUserSettings({ name, theme: 'light' });
        toggleScreens('main');
    } catch (error) {
        alert('שגיאה בהרשמה: ' + error.message);
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        toggleScreens('login');
    } catch (error) {
        alert('שגיאה בהתנתקות: ' + error.message);
    }
}

function handleAuthStateChanged(user) {
    currentUser = user;
    if (user) {
        loadUserSettings();
        document.getElementById('userDisplayName').textContent = user.displayName || 'משתמש';
        toggleScreens('main');
        loadData();
    } else {
        toggleScreens('login');
    }
}

// פונקציות ניווט
function toggleScreens(screen) {
    loginScreen.classList.add('hidden');
    registerScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
    settingsModal.classList.add('hidden');

    switch(screen) {
        case 'login':
            loginScreen.classList.remove('hidden');
            break;
        case 'register':
            registerScreen.classList.remove('hidden');
            break;
        case 'main':
            mainApp.classList.remove('hidden');
            break;
    }
}

// פונקציות הגדרות משתמש
async function saveUserSettings(settings) {
    if (!currentUser) return;
    userSettings = settings;
    localStorage.setItem(`settings_${currentUser.uid}`, JSON.stringify(settings));
}

function loadUserSettings() {
    if (!currentUser) return;
    const settings = localStorage.getItem(`settings_${currentUser.uid}`);
    if (settings) {
        userSettings = JSON.parse(settings);
        applyUserSettings();
    }
}

function applyUserSettings() {
    if (!userSettings) return;
    document.getElementById('settingsName').value = userSettings.name || '';
    document.getElementById('settingsTheme').value = userSettings.theme || 'light';
    document.body.classList.toggle('dark-theme', userSettings.theme === 'dark');
}

async function handleSettingsSave(e) {
    e.preventDefault();
    const name = document.getElementById('settingsName').value;
    const theme = document.getElementById('settingsTheme').value;
    
    await saveUserSettings({ name, theme });
    await currentUser.updateProfile({ displayName: name });
    document.getElementById('userDisplayName').textContent = name;
    settingsModal.classList.add('hidden');
    applyUserSettings();
}// פונקציות ניהול נתונים
function loadData() {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
    const fixedBudget = localStorage.getItem(`fixedBudget_${userId}`) || '0';
    const variableBudget = localStorage.getItem(`variableBudget_${userId}`) || '0';
    
    document.getElementById('fixedBudget').value = fixedBudget;
    document.getElementById('variableBudget').value = variableBudget;
    
    updateCategories();
    setDefaultDate();
    updateDisplay(expenses);
}

function saveData(expenses) {
    if (!currentUser) return;
    localStorage.setItem(`expenses_${currentUser.uid}`, JSON.stringify(expenses));
}

function saveBudgets() {
    if (!currentUser) return;
    const userId = currentUser.uid;
    const fixedBudget = document.getElementById('fixedBudget').value;
    const variableBudget = document.getElementById('variableBudget').value;
    
    localStorage.setItem(`fixedBudget_${userId}`, fixedBudget);
    localStorage.setItem(`variableBudget_${userId}`, variableBudget);
    updateDisplay(JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]'));
}

// פונקציות אפליקציה
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function updateCategories() {
    const type = document.getElementById('expenseType').value;
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = ''; // ניקוי אפשרויות קיימות
    
    CATEGORIES[type].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

function addExpense(e) {
    e.preventDefault();
    if (!currentUser) return;

    const userId = currentUser.uid;
    const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
    
    const newExpense = {
        id: Date.now(),
        type: document.getElementById('expenseType').value,
        category: document.getElementById('category').value,
        amount: Number(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        description: document.getElementById('description').value
    };

    if (!newExpense.amount || newExpense.amount <= 0) {
        alert('נא להזין סכום תקין');
        return;
    }

    expenses.push(newExpense);
    saveData(expenses);
    
    e.target.reset();
    setDefaultDate();
    updateCategories();
    updateDisplay(expenses);
}

function deleteExpense(id) {
    if (!currentUser || !confirm('האם למחוק הוצאה זו?')) return;

    const userId = currentUser.uid;
    const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
    const updatedExpenses = expenses.filter(exp => exp.id !== id);
    
    saveData(updatedExpenses);
    updateDisplay(updatedExpenses);
}

// פונקציות תצוגה
function updateDisplay(expenses) {
    updateExpenseList(expenses);
    updateStats(expenses);
    updateChart(expenses);
}

function updateExpenseList(expenses) {
    const expenseList = document.getElementById('expenseList');
    if (!expenseList) return;

    expenseList.innerHTML = expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(expense => `
            <tr>
                <td class="p-2">${new Date(expense.date).toLocaleDateString('he-IL')}</td>
                <td class="p-2">${expense.type}</td>
                <td class="p-2">${expense.category}</td>
                <td class="p-2 font-bold">${expense.amount.toLocaleString()} ₪</td>
                <td class="p-2">${expense.description}</td>
                <td class="p-2">
                    <button onclick="deleteExpense(${expense.id})" class="text-red-600 hover:text-red-800">
                        מחק
                    </button>
                </td>
            </tr>
        `).join('');
}

function updateStats(expenses) {
    const monthlyStats = document.getElementById('monthlyStats');
    if (!monthlyStats) return;

    const userId = currentUser.uid;
    const fixedBudget = Number(localStorage.getItem(`fixedBudget_${userId}`)) || 0;
    const variableBudget = Number(localStorage.getItem(`variableBudget_${userId}`)) || 0;
    
    const totalFixed = expenses
        .filter(exp => exp.type === 'הוצאות קבועות')
        .reduce((sum, exp) => sum + exp.amount, 0);
    
    const totalVariable = expenses
        .filter(exp => exp.type === 'הוצאות משתנות')
        .reduce((sum, exp) => sum + exp.amount, 0);

    monthlyStats.innerHTML = `
        <div class="space-y-4">
            <div>
                <h3 class="font-bold mb-2">הוצאות קבועות:</h3>
                <div class="flex justify-between">
                    <span>תקציב:</span>
                    <span>${fixedBudget.toLocaleString()} ₪</span>
                </div>
                <div class="flex justify-between">
                    <span>הוצאות בפועל:</span>
                    <span>${totalFixed.toLocaleString()} ₪</span>
                </div>
                <div class="flex justify-between font-bold">
                    <span>נותר:</span>
                    <span class="${fixedBudget - totalFixed >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${(fixedBudget - totalFixed).toLocaleString()} ₪
                    </span>
                </div>
            </div>
            
            <div>
                <h3 class="font-bold mb-2">הוצאות משתנות:</h3>
                <div class="flex justify-between">
                    <span>תקציב:</span>
                    <span>${variableBudget.toLocaleString()} ₪</span>
                </div>
                <div class="flex justify-between">
                    <span>הוצאות בפועל:</span>
                    <span>${totalVariable.toLocaleString()} ₪</span>
                </div>
                <div class="flex justify-between font-bold">
                    <span>נותר:</span>
                    <span class="${variableBudget - totalVariable >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${(variableBudget - totalVariable).toLocaleString()} ₪
                    </span>
                </div>
            </div>
            
            <div class="pt-4 border-t">
                <div class="flex justify-between font-bold">
                    <span>סה"כ תקציב:</span>
                    <span>${(fixedBudget + variableBudget).toLocaleString()} ₪</span>
                </div>
                <div class="flex justify-between font-bold">
                    <span>סה"כ הוצאות:</span>
                    <span>${(totalFixed + totalVariable).toLocaleString()} ₪</span>
                </div>
                <div class="flex justify-between font-bold text-lg">
                    <span>נותר סה"כ:</span>
                    <span class="${(fixedBudget + variableBudget) - (totalFixed + totalVariable) >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${((fixedBudget + variableBudget) - (totalFixed + totalVariable)).toLocaleString()} ₪
                    </span>
                </div>
            </div>
        </div>
    `;
}

function updateChart(expenses) {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;
    
    if (window.myChart) {
        window.myChart.destroy();
    }

    if (expenses.length === 0) return;

    const categoryTotals = {};
    expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });

    const data = {
        labels: Object.keys(categoryTotals),
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#C9CBCF', '#FF99CC',
                '#99FF99', '#99CCFF', '#FFB366', '#FF99FF'
            ]
        }]
    };

    window.myChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

// פונקציות ייצוא
function exportToExcel() {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
    if (expenses.length === 0) {
        alert('אין נתונים לייצוא');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(expenses);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    
    const fileName = `הוצאות-${new Date().toLocaleDateString('he-IL')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

function exportToPDF() {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
    if (expenses.length === 0) {
        alert('אין נתונים לייצוא');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.text("דוח הוצאות", 105, 15, null, null, "center");
    
    const headers = [["תאריך", "סוג", "קטגוריה", "סכום", "תיאור"]];
    const data = expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(exp => [
            new Date(exp.date).toLocaleDateString('he-IL'),
            exp.type,
            exp.category,
            `${exp.amount.toLocaleString()} ₪`,
            exp.description
        ]);

    doc.autoTable({
        head: headers,
        body: data,
        startY: 25,
        theme: 'grid',
        styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: 3,
            halign: 'right'
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 9
        }
    });

    const fileName = `הוצאות-${new Date().toLocaleDateString('he-IL')}.pdf`;
    doc.save(fileName);
}
