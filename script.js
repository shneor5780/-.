// אתחול Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// פונקציות עזר
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${
        type === 'error' ? 'bg-red-500' : 
        type === 'success' ? 'bg-green-500' : 
        'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// פונקציות גרף
function renderPieChart() {
    const ctx = document.getElementById('myPieChart').getContext('2d');
    const data = {
        labels: ['הוצאות קבועות', 'הוצאות משתנות'],
        datasets: [{
            data: [300, 200], // דוגמא לנתונים
            backgroundColor: ['#FF6384', '#36A2EB']
        }]
    };
    new Chart(ctx, {
        type: 'pie',
        data: data
    });
}

// פונקציות ייצוא
function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(JSON.parse(localStorage.getItem('expenses') || '[]'));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'הוצאות');
    XLSX.writeFile(wb, 'expenses.xlsx');
}

async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('דוח הוצאות', 10, 10);
    doc.save('expenses.pdf');
}

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', () => {
    renderPieChart();
});
