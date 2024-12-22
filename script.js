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
    document.querySelector('.container').style.display = 'none';
    
    // אירועי טופס התחברות
    document.getElementById('authForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
        } catch (error) {
            alert('שגיאת התחברות: ' + error.message);
        }
    });

    // כפתור הרשמה
    document.getElementById('registerBtn').addEventListener('click', async () => {
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
        } catch (error) {
            alert('שגיאת הרשמה: ' + error.message);
        }
    });

    // התחברות עם Google
    document.getElementById('googleAuthBtn').addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await firebase.auth().signInWithPopup(provider);
        } catch (error) {
            alert('שגיאת התחברות עם Google: ' + error.message);
        }
    });

    // כפתור התנתקות
    document.getElementById('logoutBtn').addEventListener('click', () => {
        firebase.auth().signOut();
    });

    // מעקב אחר שינויי התחברות
    firebase.auth().onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            document.getElementById('authModal').style.display = 'none';
            document.querySelector('.container').style.display = 'block';
            document.getElementById('userName').textContent = user.email;
            loadUserData();
        } else {
            document.getElementById('authModal').style.display = 'flex';
            document.querySelector('.container').style.display = 'none';
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
});function initializeApp() {
    // אתחול קטגוריות
    const categorySelect = document.getElementById('category');
    updateCategories('הוצאות קבועות');

    // מאזינים לאירועים
    document.getElementById('expenseType').addEventListener('change', (e) => {
        updateCategories(e.target.value);
    });

    document.getElementById('expenseForm').addEventListener('submit', addExpense);
    document.getElementById('incomeForm').addEventListener('submit', addIncome);
    document.getElementById('summaryType').addEventListener('change', updateDisplay);
    document.getElementById('fixedBudget').addEventListener('change', updateBudgets);
    document.getElementById('variableBudget').addEventListener('change', updateBudgets);
    
    // הגדרות
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('hidden');
    });
    
    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('hidden');
    });
    
    document.getElementById('settingsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const theme = document.getElementById('settingsTheme').value;
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        document.getElementById('settingsModal').classList.add('hidden');
    });

    // טעינת נתונים קיימים
    const budgets = getBudgets();
    document.getElementById('fixedBudget').value = budgets.fixedBudget || '';
    document.getElementById('variableBudget').value = budgets.variableBudget || '';
    
    updateDisplay();
}

function updateCategories(type) {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '';
    categories[type].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

async function addExpense(e) {
    e.preventDefault();
    const expense = {
        type: document.getElementById('expenseType').value,
        category: document.getElementById('category').value,
        amount: Number(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        description: document.getElementById('description').value
    };

    const expenses = getExpenses();
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    await saveUserData();
    
    e.target.reset();
    updateDisplay();
}

async function addIncome(e) {
    e.preventDefault();
    const income = {
        type: document.getElementById('incomeType').value,
        amount: Number(document.getElementById('incomeAmount').value),
        date: document.getElementById('incomeDate').value,
        description: document.getElementById('incomeDescription').value
    };

    const incomes = getIncomes();
    incomes.push(income);
    localStorage.setItem('incomes', JSON.stringify(incomes));
    await saveUserData();
    
    e.target.reset();
    updateDisplay();
}

async function updateBudgets() {
    const budgets = {
        fixedBudget: Number(document.getElementById('fixedBudget').value) || 0,
        variableBudget: Number(document.getElementById('variableBudget').value) || 0
    };
    localStorage.setItem('budgets', JSON.stringify(budgets));
    await saveUserData();
    updateDisplay();
}

function updateDisplay() {
    updateSummary();
    updateExpenseList();
    updateIncomeList();
    updateChart();
}

function updateSummary() {
    const summaryType = document.getElementById('summaryType').value;
    const expenses = getExpenses();
    const incomes = getIncomes();
    const budgets = getBudgets();
    
    let filteredExpenses = expenses;
    let filteredIncomes = incomes;
    let periodText = '';
    
    // סינון לפי תקופה
    const today = new Date();
    if (summaryType === 'daily') {
        const todayStr = today.toISOString().split('T')[0];
        filteredExpenses = expenses.filter(exp => exp.date === todayStr);
        filteredIncomes = incomes.filter(inc => inc.date === todayStr);
        periodText = 'היום';
    } else if (summaryType === 'weekly') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredExpenses = expenses.filter(exp => new Date(exp.date) >= weekAgo);
        filteredIncomes = incomes.filter(inc => new Date(inc.date) >= weekAgo);
        periodText = 'בשבוע האחרון';
    } else if (summaryType === 'monthly') {
        const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1);
        filteredExpenses = expenses.filter(exp => new Date(exp.date) >= monthAgo);
        filteredIncomes = incomes.filter(inc => new Date(inc.date) >= monthAgo);
        periodText = 'בחודש הנוכחי';
    }

    const totalFixed = filteredExpenses
        .filter(exp => exp.type === 'הוצאות קבועות')
        .reduce((sum, exp) => sum + exp.amount, 0);
    
    const totalVariable = filteredExpenses
        .filter(exp => exp.type === 'הוצאות משתנות')
        .reduce((sum, exp) => sum + exp.amount, 0);
    
    const totalIncome = filteredIncomes
        .reduce((sum, inc) => sum + inc.amount, 0);

    const summaryStats = document.getElementById('summaryStats');
    summaryStats.innerHTML = `
        <div class="space-y-4">
            <div>
                <h3 class="font-bold mb-2">הכנסות ${periodText}</h3>
                <p>סה"כ: ${totalIncome.toLocaleString()} ₪</p>
            </div>
            <div>
                <h3 class="font-bold mb-2">הוצאות קבועות ${periodText}</h3>
                <p>סה"כ: ${totalFixed.toLocaleString()} ₪ ${budgets.fixedBudget ? `(${((totalFixed/budgets.fixedBudget)*100).toFixed(1)}% מהתקציב)` : ''}</p>
            </div>
            <div>
                <h3 class="font-bold mb-2">הוצאות משתנות ${periodText}</h3>
                <p>סה"כ: ${totalVariable.toLocaleString()} ₪ ${budgets.variableBudget ? `(${((totalVariable/budgets.variableBudget)*100).toFixed(1)}% מהתקציב)` : ''}</p>
            </div>
            <div class="pt-4 border-t">
                <h3 class="font-bold">מאזן ${periodText}: ${(totalIncome - totalFixed - totalVariable).toLocaleString()} ₪</h3>
            </div>
        </div>
    `;
}

function updateExpenseList() {
    const expenses = getExpenses();
    const tbody = document.getElementById('expenseList');
    tbody.innerHTML = '';
    
    expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach((expense, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-2">${new Date(expense.date).toLocaleDateString('he-IL')}</td>
                <td class="p-2">${expense.type}</td>
                <td class="p-2">${expense.category}</td>
                <td class="p-2">${expense.amount.toLocaleString()} ₪</td>
                <td class="p-2">${expense.description}</td>
                <td class="p-2">
                    <button onclick="deleteExpense(${index})" class="text-red-500 hover:text-red-700">
                        מחק
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
}

function updateIncomeList() {
    const incomes = getIncomes();
    const tbody = document.getElementById('incomeList');
    tbody.innerHTML = '';
    
    incomes
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach((income, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-2">${new Date(income.date).toLocaleDateString('he-IL')}</td>
                <td class="p-2">${income.type}</td>
                <td class="p-2">${income.amount.toLocaleString()} ₪</td>
                <td class="p-2">${income.description}</td>
                <td class="p-2">
                    <button onclick="deleteIncome(${index})" class="text-red-500 hover:text-red-700">
                        מחק
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
}

async function deleteExpense(index) {
    if (!confirm('האם אתה בטוח שברצונך למחוק הוצאה זו?')) return;
    
    const expenses = getExpenses();
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    await saveUserData();
    updateDisplay();
}

async function deleteIncome(index) {
    if (!confirm('האם אתה בטוח שברצונך למחוק הכנסה זו?')) return;
    
    const incomes = getIncomes();
    incomes.splice(index, 1);
    localStorage.setItem('incomes', JSON.stringify(incomes));
    await saveUserData();
    updateDisplay();
}

function updateChart() {
    const ctx = document.getElementById('expenseChart');
    const expenses = getExpenses();
    
    if (!expenses.length) return;
    
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

function exportToExcel(type) {
    const data = type === 'expenses' ? getExpenses() : getIncomes();
    if (data.length === 0) {
        alert('אין נתונים לייצוא');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
        'תאריך': new Date(item.date).toLocaleDateString('he-IL'),
        'סוג': type === 'expenses' ? item.type : item.type,
        ...(type === 'expenses' ? {'קטגוריה': item.category} : {}),
        'סכום': item.amount,
        'תיאור': item.description
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type === 'expenses' ? "הוצאות" : "הכנסות");
    
    const fileName = `${type === 'expenses' ? 'הוצאות' : 'הכנסות'}-${new Date().toLocaleDateString('he-IL')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

function exportToPDF(type) {
    const data = type === 'expenses' ? getExpenses() : getIncomes();
    if (data.length === 0) {
        alert('אין נתונים לייצוא');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(type === 'expenses' ? "דוח הוצאות" : "דוח הכנסות", 105, 15, null, null, "center");
    
    doc.setFontSize(12);
    doc.text(`תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}`, 105, 25, null, null, "center");

    const headers = type === 'expenses' 
        ? [["תאריך", "סוג", "קטגוריה", "סכום", "תיאור"]]
        : [["תאריך", "סוג", "סכום", "תיאור"]];

    const tableData = data
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(item => type === 'expenses'
            ? [
                new Date(item.date).toLocaleDateString('he-IL'),
                item.type,
                item.category,
                `${item.amount.toLocaleString()} ₪`,
                item.description
            ]
            : [
                new Date(item.date).to
