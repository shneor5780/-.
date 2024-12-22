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

// משתני מערכת
let userSettings = {
    language: 'he',
    fontSize: 'medium',
    theme: 'light'
};

// אתחול המערכת
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // מאזיני אירועים להגדרות
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', closeSettings);
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);

    // מאזיני אירועים להוצאות
    document.getElementById('expenseForm').addEventListener('submit', addExpense);
    document.getElementById('expenseType').addEventListener('change', updateCategories);

    // אתחול ראשוני
    setDefaultDate();
    updateCategories();
    loadSettings();
    loadExpenses();
}

// פונקציות הגדרות
function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function saveSettings(e) {
    e.preventDefault();
    
    userSettings = {
        language: document.getElementById('languageSelect').value,
        fontSize: document.getElementById('fontSizeSelect').value,
        theme: document.getElementById('themeSelect').value
    };

    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    applySettings();
    closeSettings();
}

function loadSettings() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        userSettings = JSON.parse(savedSettings);
        document.getElementById('languageSelect').value = userSettings.language;
        document.getElementById('fontSizeSelect').value = userSettings.fontSize;
        document.getElementById('themeSelect').value = userSettings.theme;
        applySettings();
    }
}

function applySettings() {
    // החלת שפה
    document.documentElement.lang = userSettings.language;
    document.dir = userSettings.language === 'he' ? 'rtl' : 'ltr';

    // החלת גודל טקסט
    document.body.classList.remove('text-sm', 'text-base', 'text-lg');
    switch(userSettings.fontSize) {
        case 'small':
            document.body.classList.add('text-sm');
            break;
        case 'medium':
            document.body.classList.add('text-base');
            break;
        case 'large':
            document.body.classList.add('text-lg');
            break;
    }

    // החלת ערכת נושא
    document.body.classList.toggle('dark', userSettings.theme === 'dark');
}// פונקציות ניהול הוצאות
function addExpense(e) {
    e.preventDefault();
    
    const expense = {
        id: Date.now().toString(),
        type: document.getElementById('expenseType').value,
        category: document.getElementById('category').value,
        amount: parseFloat(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        description: document.getElementById('description').value
    };

    let expenses = getExpenses();
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    document.getElementById('expenseForm').reset();
    setDefaultDate();
    updateDisplay();
}

function deleteExpense(id) {
    let expenses = getExpenses();
    expenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateDisplay();
}

function getExpenses() {
    const expenses = localStorage.getItem('expenses');
    return expenses ? JSON.parse(expenses) : [];
}

function updateCategories() {
    const type = document.getElementById('expenseType').value;
    const categorySelect = document.getElementById('category');
    
    // ניקוי אפשרויות קיימות
    categorySelect.innerHTML = '';
    
    // הוספת האפשרויות החדשות
    CATEGORIES[type].forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// פונקציות ייצוא
function exportToPDF() {
    const expenses = getExpenses();
    if (expenses.length === 0) {
        alert('אין נתונים לייצוא');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // כותרת
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("דוח הוצאות", 105, 15, { align: "center" });

    // יצירת טבלה
    const tableData = expenses.map(expense => [
        expense.date,
        expense.type,
        expense.category,
        expense.amount.toString(),
        expense.description
    ]);

    doc.autoTable({
        head: [['תאריך', 'סוג', 'קטגוריה', 'סכום', 'תיאור']],
        body: tableData,
        startY: 25,
        headStyles: { fillColor: [41, 128, 185] },
        styles: { font: "helvetica", fontSize: 10 }
    });

    doc.save('expenses.pdf');
}

function exportToExcel() {
    const expenses = getExpenses();
    if (expenses.length === 0) {
        alert('אין נתונים לייצוא');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(expenses);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "הוצאות");
    XLSX.writeFile(workbook, "expenses.xlsx");
}

function shareData() {
    const expenses = getExpenses();
    if (expenses.length === 0) {
        alert('אין נתונים לשיתוף');
        return;
    }

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const shareText = `סך כל ההוצאות: ${totalAmount} ש"ח`;

    if (navigator.share) {
        navigator.share({
            title: 'נתוני הוצאות',
            text: shareText
        }).catch(err => {
            console.error('שגיאה בשיתוף:', err);
        });
    } else {
        alert('הדפדפן שלך לא תומך בשיתוף');
    }
}// פונקציות תצוגה
function updateDisplay() {
    const expenses = getExpenses();
    updateExpenseList(expenses);
    updateSummaryStats(expenses);
    updateExpenseChart(expenses);
}

function updateExpenseList(expenses) {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';

    expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(expense => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="p-2">${formatDate(expense.date)}</td>
            <td class="p-2">${expense.type}</td>
            <td class="p-2">${expense.category}</td>
            <td class="p-2">${formatCurrency(expense.amount)}</td>
            <td class="p-2">${expense.description}</td>
            <td class="p-2">
                <button onclick="deleteExpense('${expense.id}')" 
                        class="text-red-500 hover:text-red-700">
                    מחק
                </button>
            </td>
        `;
        expenseList.appendChild(row);
    });
}

function updateSummaryStats(expenses) {
    const summaryStats = document.getElementById('summaryStats');
    const fixedExpenses = expenses.filter(e => e.type === 'הוצאות קבועות');
    const variableExpenses = expenses.filter(e => e.type === 'הוצאות משתנות');

    const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalVariable = variableExpenses.reduce((sum, e) => sum + e.amount, 0);

    summaryStats.innerHTML = `
        <div class="space-y-2">
            <div class="flex justify-between">
                <span>סה"כ הוצאות קבועות:</span>
                <span>${formatCurrency(totalFixed)}</span>
            </div>
            <div class="flex justify-between">
                <span>סה"כ הוצאות משתנות:</span>
                <span>${formatCurrency(totalVariable)}</span>
            </div>
            <div class="flex justify-between font-bold">
                <span>סה"כ:</span>
                <span>${formatCurrency(totalFixed + totalVariable)}</span>
            </div>
        </div>
    `;
}

function updateExpenseChart(expenses) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // מחיקת גרף קיים אם יש
    if (window.expenseChart) {
        window.expenseChart.destroy();
    }

    // חישוב סכומים לפי קטגוריה
    const categoryTotals = {};
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    window.expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: generateColors(Object.keys(categoryTotals).length)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// פונקציות עזר
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('he-IL');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('he-IL', { 
        style: 'currency', 
        currency: 'ILS' 
    }).format(amount);
}

function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 360) / count;
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
}

// ייצוא פונקציות גלובליות
window.deleteExpense = deleteExpense;
window.exportToPDF = exportToPDF;
window.exportToExcel = exportToExcel;
window.shareData = shareData;
