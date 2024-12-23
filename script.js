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
const settingsDefaultView = document.getElementById('settingsDefaultView');
const closeSettings = document.getElementById('closeSettings');

// כרטיסי מידע
const totalIncome = document.getElementById('totalIncome');
const totalExpenses = document.getElementById('totalExpenses');
const balance = document.getElementById('balance');
const monthlySavings = document.getElementById('monthlySavings');

// מאזינים לאירועים
document.addEventListener('DOMContentLoaded', () => {
    incomeTab.addEventListener('click', () => switchTab('income'));
    expenseTab.addEventListener('click', () => switchTab('expense'));
    addIncomeForm.addEventListener('submit', handleAddIncome);
    addExpenseForm.addEventListener('submit', handleAddExpense);
    summaryPeriod.addEventListener('change', updateSummary);
    settingsBtn.addEventListener('click', openSettings);
    closeSettings.addEventListener('click', closeSettingsModal);
    settingsForm.addEventListener('submit', saveSettings);
    
    // אתחול ראשוני
    applySettings();
    updateUI();
});// פונקציות עזר
function formatCurrency(amount) {
   return new Intl.NumberFormat('he-IL', {
       style: 'currency',
       currency: 'ILS',
       minimumFractionDigits: 2,
       maximumFractionDigits: 2
   }).format(amount);
}

function formatDate(dateString) {
   const date = new Date(dateString);
   return new Intl.DateTimeFormat('he-IL').format(date);
}

// פונקציות ניהול טאבים
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
   const incomeCategory = document.getElementById('incomeCategory').value;
   const incomeAmount = document.getElementById('incomeAmount').value;
   const incomeDate = document.getElementById('incomeDate').value;
   const incomeDescription = document.getElementById('incomeDescription').value;

   const transaction = {
       type: 'income',
       category: incomeCategory,
       amount: +incomeAmount,
       date: incomeDate,
       description: incomeDescription,
       id: Date.now()
   };
   
   transactions.push(transaction);
   saveTransactions();
   updateUI();
   e.target.reset();
}

function handleAddExpense(e) {
   e.preventDefault();
   const expenseType = document.getElementById('expenseType').value;
   const expenseCategory = document.getElementById('expenseCategory').value;
   const expenseAmount = document.getElementById('expenseAmount').value;
   const expenseDate = document.getElementById('expenseDate').value;
   const expenseDescription = document.getElementById('expenseDescription').value;

   const transaction = {
       type: 'expense',
       expenseType: expenseType,
       category: expenseCategory,
       amount: +expenseAmount,
       date: expenseDate,
       description: expenseDescription,
       id: Date.now()
   };
   
   transactions.push(transaction);
   saveTransactions();
   updateUI();
   e.target.reset();
}

// פונקציות עדכון ממשק
function updateUI() {
   renderTransactions();
   updateSummary();
   updateChart();
   updateCards();
}

function renderTransactions() {
   transactionsList.innerHTML = '';
   
   transactions
       .sort((a, b) => new Date(b.date) - new Date(a.date))
       .forEach(transaction => {
           const row = document.createElement('tr');
           row.innerHTML = `
               <td class="p-2">${formatDate(transaction.date)}</td>
               <td class="p-2">${transaction.type === 'income' ? 'הכנסה' : 'הוצאה'}</td>
               <td class="p-2">${transaction.category}</td>
               <td class="p-2 ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}">
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
}// פונקציות תאריכים וחישובים
function getStartDate(period) {
   const today = new Date();
   switch (period) {
       case 'daily':
           return new Date(today.setHours(0, 0, 0, 0));
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
}

function getMonthlyStats() {
   const months = {};
   
   transactions.forEach(transaction => {
       const date = new Date(transaction.date);
       const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
       
       if (!months[monthKey]) {
           months[monthKey] = { income: 0, expenses: 0 };
       }
       
       if (transaction.type === 'income') {
           months[monthKey].income += transaction.amount;
       } else {
           months[monthKey].expenses += transaction.amount;
       }
   });
   
   return Object.values(months);
}

// פונקציות שמירה ומחיקה
function saveTransactions() {
   localStorage.setItem('transactions', JSON.stringify(transactions));
}

function deleteTransaction(id) {
   if (confirm('האם אתה בטוח שברצונך למחוק תנועה זו?')) {
       transactions = transactions.filter(t => t.id !== id);
       saveTransactions();
       updateUI();
   }
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
   settingsDefaultView.value = settings.defaultView;
}

function saveSettings(e) {
   e.preventDefault();
   
   settings = {
       userName: settingsName.value,
       language: settingsLanguage.value,
       fontSize: settingsFontSize.value,
       theme: settingsTheme.value,
       tableScroll: settingsTableScroll.value,
       defaultView: settingsDefaultView.value
   };
   
   localStorage.setItem('settings', JSON.stringify(settings));
   applySettings();
   closeSettingsModal();
}// פונקציות יישום הגדרות וייצוא
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
   tableWrapper.classList.remove('scroll-vertical', 'scroll-horizontal');
   tableWrapper.classList.add(`scroll-${settings.tableScroll}`);
   
   // תצוגת ברירת מחדל
   summaryPeriod.value = settings.defaultView;
   updateSummary();
}

// פונקציות ייצוא
function exportToPDF() {
   const { jsPDF } = window.jspdf;
   const doc = new jsPDF('p', 'pt', 'a4');
   
   // הגדרת כיוון RTL ופונט עברית
   doc.setR2L(true);
   doc.setFont('helvetica');
   
   // כותרת הדוח
   doc.setFontSize(20);
   doc.text('דוח תנועות כספים', doc.internal.pageSize.width/2, 50, { align: 'center' });
   
   const tableData = transactions.map(t => [
       formatDate(t.date),
       t.type === 'income' ? 'הכנסה' : 'הוצאה',
       t.category,
       formatCurrency(t.amount),
       t.description || '-'
   ]);
   
   doc.autoTable({
       head: [['תאריך', 'סוג', 'קטגוריה', 'סכום', 'תיאור']],
       body: tableData,
       startY: 70,
       theme: 'grid',
       styles: {
           font: 'helvetica',
           halign: 'right',
           textColor: [0, 0, 0],
           lineColor: [0, 0, 0],
           fontSize: 10
       },
       headStyles: {
           fillColor: [41, 128, 185],
           textColor: [255, 255, 255],
           fontSize: 12
       }
   });
   
   doc.save('דוח_תנועות_כספים.pdf');
}

function exportToExcel() {
   const excelData = transactions.map(t => ({
       'תאריך': formatDate(t.date),
       'סוג': t.type === 'income' ? 'הכנסה' : 'הוצאה',
       'קטגוריה': t.category,
       'סכום': t.amount,
       'תיאור': t.description || '-'
   }));

   const ws = XLSX.utils.json_to_sheet(excelData, {
       header: ['תאריך', 'סוג', 'קטגוריה', 'סכום', 'תיאור']
   });

   // הגדרת כיוון RTL
   ws['!RTL'] = true;

   // הגדרת רוחב עמודות
   const colWidths = [
       { wch: 15 }, // תאריך
       { wch: 10 }, // סוג
       { wch: 15 }, // קטגוריה
       { wch: 15 }, // סכום
       { wch: 30 }  // תיאור
   ];
   ws['!cols'] = colWidths;

   const wb = XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(wb, ws, 'תנועות');
   
   // שמירת הקובץ
   XLSX.writeFile(wb, 'דוח_תנועות_כספים.xlsx');
}

// אתחול כללי
document.addEventListener('DOMContentLoaded', () => {
   // התחלת האפליקציה
   applySettings();
   updateUI();

   // הגדרת תאריך ברירת מחדל בטפסים
   const today = new Date().toISOString().split('T')[0];
   document.getElementById('incomeDate').value = today;
   document.getElementById('expenseDate').value = today;
});
