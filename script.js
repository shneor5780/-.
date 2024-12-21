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
    updateCategories(); // קריאה ראשונית לעדכון קטגוריות
    setDefaultDate();
    loadBudgets();
    updateDisplay();

    // הוספת מאזיני אירועים
    document.getElementById('expenseForm').addEventListener('submit', addExpense);
    document.getElementById('expenseType').addEventListener('change', updateCategories);
    document.getElementById('fixedBudget').addEventListener('change', saveBudgets);
    document.getElementById('variableBudget').addEventListener('change', saveBudgets);
});

// עדכון קטגוריות לפי סוג ההוצאה
function updateCategories() {
    const type = document.getElementById('expenseType').value;
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = ''; // ניקוי הקטגוריות הקיימות
    
    const relevantCategories = CATEGORIES[type] || [];
    relevantCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

// הגדרת תאריך ברירת מחדל
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// שמירת תקציבים
function saveBudgets() {
    const fixedBudget = Number(document.getElementById('fixedBudget').value) || 0;
    const variableBudget = Number(document.getElementById('variableBudget').value) || 0;
    
    localStorage.setItem('fixedBudget', fixedBudget.toString());
    localStorage.setItem('variableBudget', variableBudget.toString());
    updateDisplay();
}

// טעינת תקציבים
function loadBudgets() {
    const fixedBudget = localStorage.getItem('fixedBudget') || '0';
    const variableBudget = localStorage.getItem('variableBudget') || '0';
    
    document.getElementById('fixedBudget').value = fixedBudget;
    document.getElementById('variableBudget').value = variableBudget;
}

// הוספת הוצאה חדשה
function addExpense(e) {
    e.preventDefault();
    
    const type = document.getElementById('expenseType').value;
    const category = document.getElementById('category').value;
    const amount = Number(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;

    if (!amount || amount <= 0) {
        alert('נא להזין סכום תקין');
        return;
    }

    if (!category) {
        alert('נא לבחור קטגוריה');
        return;
    }

    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const newExpense = {
        id: Date.now(),
        type,
        category,
        amount,
        date,
        description
    };

    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    e.target.reset();
    setDefaultDate();
    updateCategories();
    updateDisplay();
}

// מחיקת הוצאה
function deleteExpense(id) {
    if (!confirm('האם למחוק הוצאה זו?')) return;
    
    let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expenses = expenses.filter(exp => exp.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateDisplay();
}

// עדכון התצוגה
function updateDisplay() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    updateExpenseList(expenses);
    updateStats(expenses);
    updateChart(expenses);
}

// עדכון רשימת ההוצאות
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

// עדכון סטטיסטיקות
function updateStats(expenses) {
    const monthlyStats = document.getElementById('monthlyStats');
    if (!monthlyStats) return;

    const fixedBudget = Number(localStorage.getItem('fixedBudget')) || 0;
    const variableBudget = Number(localStorage.getItem('variableBudget')) || 0;
    
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

// עדכון גרף
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
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// ייצוא לאקסל
function exportToExcel() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
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

// ייצוא ל-PDF
function exportToPDF() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
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
