// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWi-H1IrHpy9kgVDTUCqRqkcy3K44QVhc",
  authDomain: "expense-tracker-d4247.firebaseapp.com",
  projectId: "expense-tracker-d4247",
  storageBucket: "expense-tracker-d4247.appspot.com",
  messagingSenderId: "368393545158",
  appId: "1:368393545158:web:c9292c0107f1d894c1ae3f"
};

// אתחול Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// משתני המסך
const loginScreen = document.getElementById('loginScreen');
const registerScreen = document.getElementById('registerScreen');
const mainApp = document.getElementById('mainApp');
const settingsModal = document.getElementById('settingsModal');

// משתני משתמש גלובליים
let currentUser = null;
let userSettings = null;

// קטגוריות
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
    // מאזיני אירועים למשתמשים
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('settingsForm')?.addEventListener('submit', handleSettingsSave);
    document.getElementById('showRegister')?.addEventListener('click', () => toggleScreens('register'));
    document.getElementById('showLogin')?.addEventListener('click', () => toggleScreens('login'));
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('settingsBtn')?.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    document.getElementById('closeSettings')?.addEventListener('click', () => settingsModal.classList.add('hidden'));

    // מאזיני אירועים להוצאות
    document.getElementById('expenseForm')?.addEventListener('submit', addExpense);
    document.getElementById('expenseType')?.addEventListener('change', updateCategories);
    
    // בדיקת מצב משתמש
    auth.onAuthStateChanged(handleAuthStateChanged);
});

// פונקציות אימות משתמש
async function handleLogin(e) {
    e.preventDefault();
    try {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        alert('שגיאת התחברות: ' + error.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    try {
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const name = document.getElementById('registerName').value;
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        await saveUserSettings({ name, theme: 'light' });
    } catch (error) {
        alert('שגיאת הרשמה: ' + error.message);
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
    } catch (error) {
        alert('שגיאת התנתקות: ' + error.message);
    }
}

function handleAuthStateChanged(user) {
    currentUser = user;
    if (user) {
        document.getElementById('userDisplayName').textContent = user.displayName || 'משתמש';
        loadUserSettings();
        toggleScreens('main');
        loadData();
    } else {
        toggleScreens('login');
    }
}

// ניווט בין מסכים
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
            updateCategories();
            setDefaultDate();
            break;
    }
}

// הגדרות משתמש
async function saveUserSettings(settings) {
    if (!currentUser) return;
    userSettings = settings;
    localStorage.setItem(`settings_${currentUser.uid}`, JSON.stringify(settings));
    applyUserSettings();
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
    
    try {
        await saveUserSettings({ name, theme });
        if (currentUser) {
            await currentUser.updateProfile({ displayName: name });
            document.getElementById('userDisplayName').textContent = name;
        }
        settingsModal.classList.add('hidden');
    } catch (error) {
        alert('שגיאה בשמירת הגדרות: ' + error.message);
    }
}

// פונקציות ניהול נתונים
function loadData() {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
    updateDisplay(expenses);
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function updateCategories() {
    const type = document.getElementById('expenseType').value;
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '';
    
    if (CATEGORIES[type]) {
        CATEGORIES[type].forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }
}

function addExpense(e) {
    e.preventDefault();
    if (!currentUser) return;

    const type = document.getElementById('expenseType').value;
    const category = document.getElementById('category').value;
    const amount = Number(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;

    if (!amount || amount <= 0) {
        alert('נא להזין סכום תקין');
        return;
    }

    const userId = currentUser.uid;
    const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
    
    const newExpense = {
        id: Date.now(),
        type,
        category,
        amount,
        date,
        description
    };

    expenses.push(newExpense);
    localStorage.setItem(`expenses_${userId}`, JSON.stringify(expenses));
    
    document.getElementById('expenseForm').reset();
    setDefaultDate();
    updateCategories();
    updateDisplay(expenses);
}

function deleteExpense(id) {
    if (!currentUser || !confirm('האם למחוק הוצאה זו?')) return;

    const userId = currentUser.uid;
    const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
    const updatedExpenses = expenses.filter(exp => exp.id !== id);
    
    localStorage.setItem(`expenses_${userId}`, JSON.stringify(updatedExpenses));
    updateDisplay(updatedExpenses);
}

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

    const totalFixed = expenses
        .filter(exp => exp.type === 'הוצאות קבועות')
        .reduce((sum, exp) => sum + exp.amount, 0);
    
    const totalVariable = expenses
        .filter(exp => exp.type === 'הוצאות משתנות')
        .reduce((sum, exp) => sum + exp.amount, 0);

    monthlyStats.innerHTML = `
        <div class="space-y-4">
            <div>
                <h3 class="font-bold mb-2">הוצאות קבועות</h3>
                <p>סה"כ: ${totalFixed.toLocaleString()} ₪</p>
            </div>
            <div>
                <h3 class="font-bold mb-2">הוצאות משתנות</h3>
                <p>סה"כ: ${totalVariable.toLocaleString()} ₪</p>
            </div>
            <div class="pt-4 border-t">
                <h3 class="font-bold">סה"כ כללי: ${(totalFixed + totalVariable).toLocaleString()} ₪</h3>
            </div>
        </div>
    `;
}

function updateChart(expenses) {
    const ctx = document.getElementById('expenseChart');
    if (!ctx || expenses.length === 0) return;
    
    if (window.myChart) {
        window.myChart.destroy();
    }

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
