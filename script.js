// מבני נתונים
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let settings = JSON.parse(localStorage.getItem('settings')) || {
    userName: 'משתמש',
    language: 'he',
    fontSize: 'medium',
    theme: 'light',
    tableScroll: 'vertical',
    defaultView: 'monthly'
};

// אלמנטים בדף
const incomeTab = document.getElementById('incomeTab');
const expenseTab = document.getElementById('expenseTab');
const incomeForm = document.getElementById('incomeForm');
const expenseForm = document.getElementById('expenseForm');
const addIncomeForm = document.getElementById('addIncomeForm');
const addExpenseForm = document.getElementById('addExpenseForm');
const transactionsList = document.getElementById('transactionsList');
const summaryPeriod = document.getElementById('summaryPeriod');
const summaryStats = document.getElementById('summaryStats');
const expenseChart = document.getElementById('expenseChart');
const tableWrapper = document.getElementById('tableWrapper');

// אלמנטים של הגדרות
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const settingsForm = document.getElementById('settingsForm');
const settingsName = document.getElementById('settingsName');
const settingsLanguage = document.getElementById('settingsLanguage');
const settingsFontSize = document.getElementById('settingsFontSize');
const settingsTheme = document.getElementById('settingsTheme');
const settingsTableScroll = document.getElementById('settingsTableScroll');
const closeSettings = document.getElementById('closeSettings');

// כרטיסי מידע
const totalIncome = document.getElementById('totalIncome');
const totalExpenses = document.getElementById('totalExpenses');
const balance = document.getElementById('balance');
const monthlySavings = document.getElementById('monthlySavings');

// פונקציות עזר בסיסיות
function formatCurrency(amount) {
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('he-IL');
}

// מאזינים לאירועים - אתחול
document.addEventListener('DOMContentLoaded', () => {
    // מאזיני אירועים לטאבים
    incomeTab.addEventListener('click', () => switchTab('income'));
    expenseTab.addEventListener('click', () => switchTab('expense'));
    
    // מאזיני אירועים לטפסים
    addIncomeForm.addEventListener('submit', handleAddIncome);
    addExpenseForm.addEventListener('submit', handleAddExpense);
    
    // מאזיני אירועים לסיכומים
    summaryPeriod.addEventListener('change', updateSummary);
    
    // מאזיני אירועים להגדרות
    settingsBtn.addEventListener('click', openSettings);
    closeSettings.addEventListener('click', closeSettingsModal);
    settingsForm.addEventListener('submit', saveSettings);
    
    // אתחול ראשוני של האפליקציה
    applySettings();
    updateUI();
    
    // הגדרת תאריך ברירת מחדל בטפסים
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
    document.getElementById('expenseDate').value = today;
});// פונקציות ניהול טאבים
function switchTab(tab) {
    if (tab === 'income') {
        incomeTab.classList.add('border-blue-500');
        expenseTab.classList.remove('border-blue-500');
        incomeForm.classList.remove('hidden');
        expenseForm.classList.add('hidden');
    } else {
        expenseTab.classList.add('border-blue-500');
        incomeTab.classList.remove('border-blue-500');
        expenseForm.classList.remove('hidden');
        incomeForm.classList.add('hidden');
    }
}

// פונקציות הוספת תנועות
function handleAddIncome(e) {
    e.preventDefault();
    
    const transaction = {
        id: Date.now(),
        type: 'income',
        category: document.getElementById('incomeCategory').value,
        amount: parseFloat(document.getElementById('incomeAmount').value),
        date: document.getElementById('incomeDate').value,
        description: document.getElementById('incomeDescription').value
    };

    // וידוא תקינות הנתונים
    if (!transaction.category || !transaction.amount || !transaction.date) {
        alert('נא למלא את כל השדות החובה');
        return;
    }

    transactions.push(transaction);
    saveTransactions();
    updateUI();
    e.target.reset();
    
    // הגדרת תאריך ברירת מחדל לאחר איפוס הטופס
    document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
    
    // הודעת הצלחה
    showNotification('ההכנסה נוספה בהצלחה', 'success');
}

function handleAddExpense(e) {
    e.preventDefault();
    
    const transaction = {
        id: Date.now(),
        type: 'expense',
        category: document.getElementById('expenseCategory').value,
        expenseType: document.getElementById('expenseType').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        date: document.getElementById('expenseDate').value,
        description: document.getElementById('expenseDescription').value
    };

    // וידוא תקינות הנתונים
    if (!transaction.category || !transaction.amount || !transaction.date) {
        alert('נא למלא את כל השדות החובה');
        return;
    }

    transactions.push(transaction);
    saveTransactions();
    updateUI();
    e.target.reset();
    
    // הגדרת תאריך ברירת מחדל לאחר איפוס הטופס
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    
    // הודעת הצלחה
    showNotification('ההוצאה נוספה בהצלחה', 'success');
}

// פונקציית התראה
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } shadow-lg z-50 fade-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // הסרת ההתראה אחרי 3 שניות
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// פונקציית שמירה בלוקל סטורג'
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// פונקציית מחיקת תנועה
function deleteTransaction(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק תנועה זו?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateUI();
        showNotification('התנועה נמחקה בהצלחה', 'success');
    }
}// פונקציות עדכון ממשק
function updateUI() {
    renderTransactions();
    updateSummary();
    updateChart();
    updateCards();
}

function updateCards() {
    // חישוב סך הכל
    const totals = {
        income: transactions.reduce((sum, t) => 
            t.type === 'income' ? sum + t.amount : sum, 0),
        expenses: transactions.reduce((sum, t) => 
            t.type === 'expense' ? sum + t.amount : sum, 0)
    };
    
    // עדכון הכרטיסים
    totalIncome.innerHTML = formatCurrency(totals.income);
    totalExpenses.innerHTML = formatCurrency(totals.expenses);
    balance.innerHTML = formatCurrency(totals.income - totals.expenses);

    // חישוב חיסכון חודשי
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === currentMonth && 
               transDate.getFullYear() === currentYear;
    });

    const monthlyTotals = {
        income: monthlyTransactions.reduce((sum, t) => 
            t.type === 'income' ? sum + t.amount : sum, 0),
        expenses: monthlyTransactions.reduce((sum, t) => 
            t.type === 'expense' ? sum + t.amount : sum, 0)
    };

    monthlySavings.innerHTML = formatCurrency(monthlyTotals.income - monthlyTotals.expenses);
}

function renderTransactions() {
    transactionsList.innerHTML = '';
    
    // מיון התנועות לפי תאריך (מהחדש לישן)
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    sortedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${formatDate(transaction.date)}</td>
            <td class="p-2">${transaction.type === 'income' ? 'הכנסה' : 'הוצאה'}</td>
            <td class="p-2">${transaction.category}</td>
            <td class="p-2 ${transaction.type === 'income' ? 'text-success' : 'text-error'}">
                ${formatCurrency(transaction.amount)}
            </td>
            <td class="p-2">${transaction.description || '-'}</td>
            <td class="p-2">
                <button onclick="deleteTransaction(${transaction.id})" 
                        class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                    מחיקה
                </button>
            </td>
        `;
        transactionsList.appendChild(row);
    });
}

function updateSummary() {
    const period = summaryPeriod.value;
    const startDate = getStartDate(period);
    const filteredTransactions = transactions.filter(t => 
        new Date(t.date) >= startDate
    );
    
    const summary = {
        income: filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
        expenses: filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
        expensesByCategory: {},
        expensesByType: {
            fixed: filteredTransactions
                .filter(t => t.type === 'expense' && t.expenseType === 'קבועות')
                .reduce((sum, t) => sum + t.amount, 0),
            variable: filteredTransactions
                .filter(t => t.type === 'expense' && t.expenseType === 'משתנות')
                .reduce((sum, t) => sum + t.amount, 0)
        }
    };
    
    // חישוב הוצאות לפי קטגוריה
    filteredTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            summary.expensesByCategory[t.category] = 
                (summary.expensesByCategory[t.category] || 0) + t.amount;
        });
    
    // עדכון הסיכום בממשק
    summaryStats.innerHTML = `
        <div class="space-y-2">
            <p>סך הכנסות: <strong>${formatCurrency(summary.income)}</strong></p>
            <p>סך הוצאות: <strong>${formatCurrency(summary.expenses)}</strong></p>
            <p>יתרה: <strong class="${summary.income - summary.expenses >= 0 ? 'text-success' : 'text-error'}">
                ${formatCurrency(summary.income - summary.expenses)}
            </strong></p>
            <hr class="my-2">
            <p>הוצאות קבועות: <strong>${formatCurrency(summary.expensesByType.fixed)}</strong></p>
            <p>הוצאות משתנות: <strong>${formatCurrency(summary.expensesByType.variable)}</strong></p>
        </div>
    `;
    
    return summary;
}

function getStartDate(period) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (period) {
        case 'daily':
            return today;
        case 'weekly':
            const first = today.getDate() - today.getDay();
            return new Date(today.setDate(first));
        case 'monthly':
            return new Date(today.getFullYear(), today.getMonth(), 1);
        case 'yearly':
            return new Date(today.getFullYear(), 0, 1);
        default:
            return new Date(0);
    }
}// פונקציות גרף
function updateChart() {
    const summary = updateSummary();
    const ctx = expenseChart.getContext('2d');
    
    // מחיקת גרף קיים אם יש
    if (window.myChart) {
        window.myChart.destroy();
    }
    
    const categories = Object.keys(summary.expensesByCategory);
    const values = Object.values(summary.expensesByCategory);
    
    window.myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#FF6384', // אדום
                    '#36A2EB', // כחול
                    '#FFCE56', // צהוב
                    '#4BC0C0', // טורקיז
                    '#9966FF', // סגול
                    '#FF9F40', // כתום
                    '#50C878', // ירוק
                    '#C9CBCF'  // אפור
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Rubik',
                            size: 12
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// פונקציות הגדרות
function openSettings() {
    settingsModal.classList.remove('hidden');
    loadSettings();
}

function closeSettingsModal() {
    settingsModal.classList.add('hidden');
}

function loadSettings() {
    settingsName.value = settings.userName;
    settingsLanguage.value = settings.language;
    settingsFontSize.value = settings.fontSize;
    settingsTheme.value = settings.theme;
    settingsTableScroll.value = settings.tableScroll;
}

function saveSettings(e) {
    e.preventDefault();
    
    settings = {
        userName: settingsName.value,
        language: settingsLanguage.value,
        fontSize: settingsFontSize.value,
        theme: settingsTheme.value,
        tableScroll: settingsTableScroll.value,
        defaultView: summaryPeriod.value
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
    applySettings();
    closeSettingsModal();
    showNotification('ההגדרות נשמרו בהצלחה', 'success');
}

function applySettings() {
    // שם משתמש
    document.getElementById('userName').textContent = settings.userName;
    
    // גודל גופן
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.body.classList.add(`font-size-${settings.fontSize}`);
    
    // ערכת נושא
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${settings.theme}-theme`);
    
    // כיוון גלילת טבלה
    tableWrapper.className = `overflow-x-auto scroll-${settings.tableScroll}`;
    
    // שפה
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'he' ? 'rtl' : 'ltr';
    
    // עדכון ממשק
    updateUI();
}

// מאזיני אירועים נוספים להגדרות
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettingsModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
        closeSettingsModal();
    }
});// פונקציות ייצוא
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    
    // הגדרת כיוון RTL ופונט
    doc.setR2L(true);
    
    // כותרת הדוח
    doc.setFontSize(20);
    doc.text('דוח תנועות כספים', doc.internal.pageSize.width/2, 50, { align: 'center' });
    
    // מידע כללי
    doc.setFontSize(12);
    const today = new Date().toLocaleDateString('he-IL');
    doc.text(`תאריך הפקה: ${today}`, 40, 80);
    doc.text(`סך הכנסות: ${totalIncome.textContent}`, 40, 100);
    doc.text(`סך הוצאות: ${totalExpenses.textContent}`, 40, 120);
    doc.text(`יתרה: ${balance.textContent}`, 40, 140);
    
    // טבלת תנועות
    const tableData = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(t => [
            formatDate(t.date),
            t.type === 'income' ? 'הכנסה' : 'הוצאה',
            t.category,
            formatCurrency(t.amount),
            t.description || '-'
        ]);
    
    doc.autoTable({
        head: [['תאריך', 'סוג', 'קטגוריה', 'סכום', 'תיאור']],
        body: tableData,
        startY: 170,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 10,
            halign: 'right',
            cellPadding: 6,
            lineWidth: 0.5,
            lineColor: [0, 0, 0],
            textColor: [0, 0, 0]
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontSize: 12,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        margin: { top: 180 }
    });
    
    doc.save('דוח_תנועות_כספים.pdf');
    showNotification('הדוח יוצא בהצלחה ל-PDF', 'success');
}

function exportToExcel() {
    const ws_data = [
        ['תאריך', 'סוג', 'קטגוריה', 'סכום', 'תיאור']
    ];
    
    // הוספת הנתונים
    transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(t => {
            ws_data.push([
                formatDate(t.date),
                t.type === 'income' ? 'הכנסה' : 'הוצאה',
                t.category,
                t.amount,
                t.description || '-'
            ]);
        });
    
    // יצירת גיליון עבודה
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    // הגדרת רוחב עמודות
    ws['!cols'] = [
        { wch: 15 },  // תאריך
        { wch: 10 },  // סוג
        { wch: 15 },  // קטגוריה
        { wch: 12 },  // סכום
        { wch: 30 }   // תיאור
    ];
    
    // יצירת קובץ אקסל
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'תנועות');
    
    // שמירת הקובץ
    XLSX.writeFile(wb, 'דוח_תנועות_כספים.xlsx');
    showNotification('הדוח יוצא בהצלחה ל-Excel', 'success');
}

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', () => {
    // אתחול ראשוני של ההגדרות
    applySettings();
    
    // הגדרת תאריך ברירת מחדל בטפסים
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.value = today;
        input.max = today;  // לא מאפשר להזין תאריך עתידי
    });
    
    // אתחול הטאבים
    switchTab('income');
    
    // אתחול הממשק
    updateUI();
    
    // טעינת התנועות האחרונות
    if (transactions.length > 0) {
        showNotification(`נטענו ${transactions.length} תנועות מהזיכרון`, 'info');
    }
});
