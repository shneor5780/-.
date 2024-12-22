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
const settingsModal = document.getElementById('settingsModal');
let userSettings = loadSettings();

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

    // אתחול התצוגה
    setDefaultDate();
    updateCategories();
    applySettings();
    loadData();
});

// פונקציות הגדרות
function loadSettings() {
    const defaultSettings = {
        name: 'משתמש',
        theme: 'light',
        defaultView: 'monthly'
    };
    const savedSettings = localStorage.getItem('userSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
}

function saveSettings(settings) {
    localStorage.setItem('userSettings', JSON.stringify(settings));
}

function applySettings() {
    document.getElementById('userName').textContent = userSettings.name;
    document.getElementById('settingsName').value = userSettings.name;
    document.getElementById('settingsTheme').value = userSettings.theme;
    document.getElementById('defaultView').value = userSettings.defaultView;
    document.getElementById('summaryType').value = userSettings.defaultView;
   
    document.body.classList.toggle('dark-theme', userSettings.theme === 'dark');
}

function handleSettingsSave(e) {
    e.preventDefault();
    userSettings = {
        name: document.getElementById('settingsName').value,
        theme: document.getElementById('settingsTheme').value,
        defaultView: document.getElementById('defaultView').value
    };
    saveSettings(userSettings);
    applySettings();
    settingsModal.classList.add('hidden');
    updateDisplay();
}

// פונקציות ניהול נתונים
function loadData() {
    const expenses = getExpenses();
    const { fixedBudget, variableBudget } = getBudgets();
   
    document.getElementById('fixedBudget').value = fixedBudget;
    document.getElementById('variableBudget').value = variableBudget;
   
    updateDisplay();
}

function getExpenses() {
    return JSON.parse(localStorage.getItem('expenses') || '[]');
}

function getBudgets() {
    return {
        fixedBudget: Number(localStorage.getItem('fixedBudget')) || 0,
        variableBudget: Number(localStorage.getItem('variableBudget')) || 0
    };
}

function saveBudgets() {
    const fixedBudget = document.getElementById('fixedBudget').value;
    const variableBudget = document.getElementById('variableBudget').value;
   
    localStorage.setItem('fixedBudget', fixedBudget);
    localStorage.setItem('variableBudget', variableBudget);
   
    updateDisplay();
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function updateCategories() {
    const type = document.getElementById('expenseType').value;
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '';
   
    CATEGORIES[type].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

function addExpense(e) {
    e.preventDefault();
    const expenses = getExpenses();
   
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
    localStorage.setItem('expenses', JSON.stringify(expenses));
   
    e.target.reset();
    setDefaultDate();
    updateCategories();
    updateDisplay();
}

function deleteExpense(id) {
    if (!confirm('האם למחוק הוצאה זו?')) return;

    const expenses = getExpenses().filter(exp => exp.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateDisplay();
}// פונקציות תצוגה
function updateDisplay() {
    const expenses = getExpenses();
    const summaryType = document.getElementById('summaryType').value;
   
    updateExpenseList(expenses);
    updateSummaryStats(expenses, summaryType);
    updateChart(expenses);
}

function updateExpenseList(expenses) {
    const expenseList = document.getElementById('expenseList');
   
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

function updateSummaryStats(expenses, summaryType) {
    const summaryStats = document.getElementById('summaryStats');
    const today = new Date();
    let filteredExpenses;
    let periodText;

    switch(summaryType) {
        case 'daily':
            const todayStr = today.toISOString().split('T')[0];
            filteredExpenses = expenses.filter(exp => exp.date === todayStr);
            periodText = 'היום';
            break;
        case 'weekly':
            const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
            filteredExpenses = expenses.filter(exp => new Date(exp.date) >= weekStart);
            periodText = 'השבוע';
            break;
        case 'monthly':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            filteredExpenses = expenses.filter(exp => new Date(exp.date) >= monthStart);
            periodText = 'החודש';
            break;
        default:
            filteredExpenses = expenses;
            periodText = 'סה"כ';
    }

    const totalFixed = filteredExpenses
        .filter(exp => exp.type === 'הוצאות קבועות')
        .reduce((sum, exp) => sum + exp.amount, 0);
   
    const totalVariable = filteredExpenses
        .filter(exp => exp.type === 'הוצאות משתנות')
        .reduce((sum, exp) => sum + exp.amount, 0);

    const { fixedBudget, variableBudget } = getBudgets();

    summaryStats.innerHTML = `
        <div class="space-y-4">
            <div>
                <h3 class="font-bold mb-2">הוצאות קבועות ${periodText}</h3>
                <p>סה"כ: ${totalFixed.toLocaleString()} ₪ ${fixedBudget ? `(${((totalFixed/fixedBudget)*100).toFixed(1)}% מהתקציב)` : ''}</p>
            </div>
            <div>
                <h3 class="font-bold mb-2">הוצאות משתנות ${periodText}</h3>
                <p>סה"כ: ${totalVariable.toLocaleString()} ₪ ${variableBudget ? `(${((totalVariable/variableBudget)*100).toFixed(1)}% מהתקציב)` : ''}</p>
            </div>
            <div class="pt-4 border-t">
                <h3 class="font-bold">סה"כ ${periodText}: ${(totalFixed + totalVariable).toLocaleString()} ₪</h3>
                ${(fixedBudget || variableBudget) ?
                    `<p>נותר בתקציב: ${((fixedBudget + variableBudget) - (totalFixed + totalVariable)).toLocaleString()} ₪</p>`
                    : ''}
            </div>
        </div>
    `;
}

function updateChart(expenses) {
    const ctx = document.getElementById('expenseChart');
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

// פונקציות ייצוא
function exportToExcel() {
    const expenses = getExpenses();
    if (expenses.length === 0) {
        alert('אין נתונים לייצוא');
        return;
    }

    // הכנת הנתונים בפורמט מסודר
    const exportData = expenses.map(exp => ({
        'תאריך': new Date(exp.date).toLocaleDateString('he-IL'),
        'סוג הוצאה': exp.type,
        'קטגוריה': exp.category,
        'סכום': exp.amount,
        'תיאור': exp.description
    }));

    // יצירת גיליון עבודה
    const worksheet = XLSX.utils.json_to_sheet(exportData, {
        header: ['תאריך', 'סוג הוצאה', 'קטגוריה', 'סכום', 'תיאור']
    });

    // סידור רוחב העמודות
    const colWidths = [
        { wch: 12 }, // תאריך
        { wch: 15 }, // סוג הוצאה
        { wch: 15 }, // קטגוריה
        { wch: 10 }, // סכום
        { wch: 30 }  // תיאור
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "הוצאות");
   
    const fileName = `הוצאות-${new Date().toLocaleDateString('he-IL')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

function exportToPDF() {
    const expenses = getExpenses();
    if (expenses.length === 0) {
        alert('אין נתונים לייצוא');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // הגדרת כותרת
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("דוח הוצאות", 105, 15, null, null, "center");
   
    // הוספת תאריך הפקה
    doc.setFontSize(12);
    doc.text(`תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}`, 105, 25, null, null, "center");

    // הכנת נתונים לטבלה
    const headers = [["תאריך", "סוג הוצאה", "קטגוריה", "סכום", "תיאור"]];
    const data = expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(exp => [
            new Date(exp.date).toLocaleDateString('he-IL'),
            exp.type,
            exp.category,
            `${exp.amount.toLocaleString()} ₪`,
            exp.description
        ]);

    // הוספת סיכומים
    const totalFixed = expenses
        .filter(exp => exp.type === 'הוצאות קבועות')
        .reduce((sum, exp) => sum + exp.amount, 0);
   
    const totalVariable = expenses
        .filter(exp => exp.type === 'הוצאות משתנות')
        .reduce((sum, exp) => sum + exp.amount, 0);

    // יצירת טבלה
    doc.autoTable({
        head: headers,
        body: data,
        startY: 35,
        theme: 'grid',
        styles: {
            font: "helvetica",
            fontSize: 9,
            cellPadding: 3,
            halign: 'right',
            direction: 'rtl',
            textColor: [0, 0, 0]
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        }
    });

    // הוספת סיכום בסוף
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(12);
    doc.text(`סה"כ הוצאות קבועות: ${totalFixed.toLocaleString()} ₪`, 190, finalY + 15, null, null, "right");
    doc.text(`סה"כ הוצאות משתנות: ${totalVariable.toLocaleString()} ₪`, 190, finalY + 25, null, null, "right");
    doc.setFont("helvetica", "bold");
    doc.text(`סה"כ כללי: ${(totalFixed + totalVariable).toLocaleString()} ₪`, 190, finalY + 35, null, null, "right");

    const fileName = `הוצאות-${new Date().toLocaleDateString('he-IL')}.pdf`;
    doc.save(fileName);
}
