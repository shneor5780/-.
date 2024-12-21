// הגדרת קטגוריות קבועות ומשתנות
const CATEGORIES = {
    'הוצאות קבועות': [
        'שכר/משכנתא',
        'חשמל',
        'מים',
        'ארנונה',
        'מיסי יישוב',
        'גז',
        'אינטרנט',
        'טלפון',
        'ביטוח רכב',
        'ביטוח חיים',
        'ביטוח בריאות',
        'מנוי לחדר כושר',
        'הלוואות'
    ],
    'הוצאות משתנות': [
        'סופר',
        'מסעדה',
        'דלק',
        'ביגוד והנעלה',
        'הוצאות בלתי צפויות',
        'ביקור אצל רופא',
        'קורסים/שיעורים',
        'ציוד לבית'
    ]
};

// אתחול המערכת
document.addEventListener('DOMContentLoaded', () => {
    updateCategories();
    document.getElementById('expenseType').addEventListener('change', updateCategories);
    document.getElementById('expenseForm').addEventListener('submit', addExpense);
});

// עדכון קטגוריות בהתאם לסוג ההוצאה
function updateCategories() {
    const type = document.getElementById('expenseType').value;
    const categorySelect = document.getElementById('category');
    const categories = CATEGORIES[type] || [];
    
    categorySelect.innerHTML = categories
        .map(cat => `<option value="${cat}">${cat}</option>`)
        .join('');
}

// הוספת הוצאה
function addExpense(event) {
    event.preventDefault();
    const expense = {
        type: document.getElementById('expenseType').value,
        category: document.getElementById('category').value,
        amount: Number(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        description: document.getElementById('description').value
    };
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateExpenseList();
}

// עדכון רשימת ההוצאות
function updateExpenseList() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = expenses.map(expense => `
        <tr>
            <td class="p-2 text-right">${expense.date}</td>
            <td class="p-2 text-right">${expense.type}</td>
            <td class="p-2 text-right">${expense.category}</td>
            <td class="p-2 text-right">${expense.amount}</td>
            <td class="p-2 text-right">${expense.description}</td>
        </tr>
    `).join('');
}

// ייצוא ל-PDF
function exportToPDF() {
    const doc = new jspdf.jsPDF();
    doc.autoTable({ html: '#expenseList' });
    doc.save('expenses.pdf');
}

// ייצוא ל-Excel
function exportToExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(document.getElementById('expenseList'));
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    XLSX.writeFile(wb, 'expenses.xlsx');
}

// הצגת גרף התפלגות הוצאות
function displayExpenseChart() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const categories = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});
    const ctx = document.getElementById('expenseChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF5733', '#33FF57', '#5733FF', '#F39C12', '#8E44AD']
            }]
        }
    });
}

// הצגת סיכום חודשי
function displayMonthlySummary() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const monthlyExpenses = expenses.reduce((acc, expense) => {
        const month = expense.date.slice(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
    }, {});
    const summary = Object.entries(monthlyExpenses).map(([month, total]) => `
        <div>${month}: ${total} ש"ח</div>
    `).join('');
    document.getElementById('monthlyStats').innerHTML = summary;
}

// קריאה לפונקציות להצגת נתונים
document.addEventListener('DOMContentLoaded', () => {
    updateExpenseList();
    displayExpenseChart();
    displayMonthlySummary();
});
