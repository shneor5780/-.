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

// תרגומים
const translations = {
    he: {
        fixedExpenses: 'הוצאות קבועות',
        variableExpenses: 'הוצאות משתנות',
        amount: 'סכום',
        date: 'תאריך',
        description: 'תיאור',
        category: 'קטגוריה',
        settings: 'הגדרות',
        save: 'שמור',
        cancel: 'ביטול'
    },
    en: {
        fixedExpenses: 'Fixed Expenses',
        variableExpenses: 'Variable Expenses',
        amount: 'Amount',
        date: 'Date',
        description: 'Description',
        category: 'Category',
        settings: 'Settings',
        save: 'Save',
        cancel: 'Cancel'
    }
};

// משתני מערכת
const settingsModal = document.getElementById('settingsModal');
let userSettings = loadSettings();
let currentUser = null;

// Google Auth
function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    currentUser = {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        image: profile.getImageUrl()
    };
    updateUIForAuth();
    loadUserData();
}

function signOut() {
    const auth2 = gapi.auth2.getInstance();
    auth2.signOut().then(() => {
        currentUser = null;
        updateUIForAuth();
    });
}

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

    // מאזיני אירועים לשפה וגודל טקסט
    document.getElementById('languageSelect').addEventListener('change', (e) => changeLanguage(e.target.value));
    document.getElementById('fontSizeSelect').addEventListener('change', (e) => changeFontSize(e.target.value));

    // אתחול התצוגה
    setDefaultDate();
    updateCategories();
    applySettings();
    loadData();
});// פונקציות הגדרות
function loadSettings() {
    const defaultSettings = {
        name: 'משתמש',
        theme: 'light',
        defaultView: 'monthly',
        fontSize: 'medium',
        language: 'he',
        notifications: {
            budgetAlert: true,
            weeklyReport: false
        }
    };
    const savedSettings = localStorage.getItem('userSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
}

function saveSettings(settings) {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    if (currentUser) {
        // שמירת הגדרות בענן אם המשתמש מחובר
        saveToCloud('settings', settings);
    }
}

function applySettings() {
    document.getElementById('userName').textContent = userSettings.name;
    document.getElementById('settingsName').value = userSettings.name;
    document.getElementById('settingsTheme').value = userSettings.theme;
    document.getElementById('defaultView').value = userSettings.defaultView;
    document.getElementById('summaryType').value = userSettings.defaultView;
    document.getElementById('languageSelect').value = userSettings.language;
    document.getElementById('fontSizeSelect').value = userSettings.fontSize;
    
    // החלת ערכת נושא
    document.body.className = `theme-${userSettings.theme} font-size-${userSettings.fontSize}`;
    
    // החלת שפה
    changeLanguage(userSettings.language);
    
    // הגדרת התראות
    if (userSettings.notifications) {
        document.getElementById('notifyBudget').checked = userSettings.notifications.budgetAlert;
        document.getElementById('notifyWeekly').checked = userSettings.notifications.weeklyReport;
    }
}

function handleSettingsSave(e) {
    e.preventDefault();
    userSettings = {
        name: document.getElementById('settingsName').value,
        theme: document.getElementById('settingsTheme').value,
        defaultView: document.getElementById('defaultView').value,
        fontSize: document.getElementById('fontSizeSelect').value,
        language: document.getElementById('languageSelect').value,
        notifications: {
            budgetAlert: document.getElementById('notifyBudget').checked,
            weeklyReport: document.getElementById('notifyWeekly').checked
        }
    };
    saveSettings(userSettings);
    applySettings();
    settingsModal.classList.add('hidden');
    updateDisplay();
}

// פונקציות שפה וגודל טקסט
function changeLanguage(lang) {
    document.documentElement.lang = lang;
    document.dir = lang === 'he' ? 'rtl' : 'ltr';
    
    // עדכון טקסטים
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

function changeFontSize(size) {
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.body.classList.add(`font-size-${size}`);
}

// פונקציות שיתוף וגיבוי
function shareData() {
    if (navigator.share) {
        const expenses = getExpenses();
        const shareData = {
            title: 'נתוני תקציב',
            text: `סה"כ הוצאות: ${calculateTotalExpenses(expenses)} ₪`,
            url: window.location.href
        };
        
        navigator.share(shareData)
            .catch((error) => console.log('Error sharing:', error));
    } else {
        alert('שיתוף אינו נתמך בדפדפן זה');
    }
}

function saveToCloud(type, data) {
    if (!currentUser) return;
    
    // כאן יש להוסיף את הלוגיקה לשמירה בשירות ענן
    console.log(`Saving ${type} to cloud for user ${currentUser.id}`);
}

// פונקציות ניהול נתונים
function loadData() {
    if (currentUser) {
        // טעינת נתונים מהענן אם המשתמש מחובר
        loadFromCloud();
    } else {
        const expenses = getExpenses();
        const { fixedBudget, variableBudget } = getBudgets();
        
        document.getElementById('fixedBudget').value = fixedBudget;
        document.getElementById('variableBudget').value = variableBudget;
        
        updateDisplay();
    }
}// פונקציות תצוגה
function updateDisplay() {
    const expenses = getExpenses();
    const summaryType = document.getElementById('summaryType').value;
    
    updateSummaryStats(expenses, summaryType);
    updateExpenseChart(expenses);
    updateExpenseList(expenses);
    checkBudgetAlerts(expenses);
}

function updateSummaryStats(expenses, type) {
    const stats = calculateStats(expenses, type);
    const summaryStats = document.getElementById('summaryStats');
    const { fixedBudget, variableBudget } = getBudgets();

    let html = `
        <div class="space-y-2">
            <div class="flex justify-between">
                <span>סה"כ הוצאות קבועות:</span>
                <span class="${stats.totalFixed > fixedBudget ? 'text-red-500' : 'text-green-500'}">
                    ${stats.totalFixed.toLocaleString()} ₪
                </span>
            </div>
            <div class="flex justify-between">
                <span>סה"כ הוצאות משתנות:</span>
                <span class="${stats.totalVariable > variableBudget ? 'text-red-500' : 'text-green-500'}">
                    ${stats.totalVariable.toLocaleString()} ₪
                </span>
            </div>
            <div class="flex justify-between font-bold">
                <span>סה"כ:</span>
                <span>${(stats.totalFixed + stats.totalVariable).toLocaleString()} ₪</span>
            </div>
        </div>
    `;

    summaryStats.innerHTML = html;
}

function updateExpenseChart(expenses) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const categoryTotals = calculateCategoryTotals(expenses);

    if (window.expenseChart) {
        window.expenseChart.destroy();
    }

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
                    position: 'right',
                    labels: {
                        font: {
                            size: parseInt(getComputedStyle(document.documentElement).fontSize)
                        }
                    }
                }
            }
        }
    });
}

function updateExpenseList(expenses) {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';

    expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(expense => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="p-2">${new Date(expense.date).toLocaleDateString('he-IL')}</td>
            <td class="p-2">${expense.type}</td>
            <td class="p-2">${expense.category}</td>
            <td class="p-2">${expense.amount.toLocaleString()} ₪</td>
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

// פונקציות התראות
function checkBudgetAlerts(expenses) {
    if (!userSettings.notifications?.budgetAlert) return;

    const { fixedBudget, variableBudget } = getBudgets();
    const stats = calculateStats(expenses, 'monthly');

    if (stats.totalFixed > fixedBudget) {
        showNotification('חריגה מתקציב', 'חרגת מתקציב ההוצאות הקבועות החודשי');
    }

    if (stats.totalVariable > variableBudget) {
        showNotification('חריגה מתקציב', 'חרגת מתקציב ההוצאות המשתנות החודשי');
    }
}

function showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body: message });
            }
        });
    }
}// פונקציות ייצוא
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const expenses = getExpenses();
    const stats = calculateStats(expenses, 'monthly');

    // הגדרת כיוון RTL
    doc.setR2L(true);

    // כותרת
    doc.setFontSize(20);
    doc.text('דוח הוצאות', 190, 20, null, null, "right");
    doc.setFontSize(12);
    doc.text(new Date().toLocaleDateString('he-IL'), 190, 30, null, null, "right");

    // טבלת הוצאות
    const tableData = expenses.map(expense => [
        expense.date,
        expense.type,
        expense.category,
        `${expense.amount.toLocaleString()} ₪`,
        expense.description
    ]);

    doc.autoTable({
        head: [['תאריך', 'סוג', 'קטגוריה', 'סכום', 'תיאור']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        styles: {
            font: 'helvetica',
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

    // סיכום
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(12);
    doc.text(`סה"כ הוצאות קבועות: ${stats.totalFixed.toLocaleString()} ₪`, 190, finalY + 15, null, null, "right");
    doc.text(`סה"כ הוצאות משתנות: ${stats.totalVariable.toLocaleString()} ₪`, 190, finalY + 25, null, null, "right");
    doc.setFont("helvetica", "bold");
    doc.text(`סה"כ כללי: ${(stats.totalFixed + stats.totalVariable).toLocaleString()} ₪`, 190, finalY + 35, null, null, "right");

    const fileName = `הוצאות-${new Date().toLocaleDateString('he-IL')}.pdf`;
    doc.save(fileName);
}

function exportToExcel() {
    const expenses = getExpenses();
    const ws = XLSX.utils.json_to_sheet(expenses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "הוצאות");
    
    // התאמת רוחב עמודות
    const cols = [
        { wch: 12 }, // תאריך
        { wch: 15 }, // סוג
        { wch: 15 }, // קטגוריה
        { wch: 10 }, // סכום
        { wch: 30 }  // תיאור
    ];
    ws['!cols'] = cols;

    const fileName = `הוצאות-${new Date().toLocaleDateString('he-IL')}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// פונקציות עזר
function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 360) / count;
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
}

function calculateStats(expenses, type) {
    const now = new Date();
    const filtered = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        switch (type) {
            case 'daily':
                return expenseDate.toDateString() === now.toDateString();
            case 'weekly':
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                return expenseDate >= weekAgo;
            case 'monthly':
                return expenseDate.getMonth() === now.getMonth() &&
                       expenseDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    });

    return {
        totalFixed: filtered.filter(e => e.type === 'הוצאות קבועות')
                           .reduce((sum, e) => sum + e.amount, 0),
        totalVariable: filtered.filter(e => e.type === 'הוצאות משתנות')
                              .reduce((sum, e) => sum + e.amount, 0)
    };
}

function calculateCategoryTotals(expenses) {
    return expenses.reduce((totals, expense) => {
        totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
        return totals;
    }, {});
}

// פונקציות אתחול
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function updateCategories() {
    const type = document.getElementById('expenseType').value;
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = CATEGORIES[type]
        .map(cat => `<option value="${cat}">${cat}</option>`)
        .join('');
}

// ייצוא פונקציות
window.deleteExpense = deleteExpense;
window.exportToPDF = exportToPDF;
window.exportToExcel = exportToExcel;
window.shareData = shareData;
window.onSignIn = onSignIn;
window.signOut = signOut;
