/**
 * Dashboard Logic
 * Handles population of summary cards and mini charts on the dashboard.
 */

document.addEventListener('DOMContentLoaded', async () => {
    await updateDashboardUI();
    await renderMiniChart();
});

async function updateDashboardUI() {
    const stats = await getSummaryStats();
    if (!stats) return; // User not logged in
    
    // Welcome message
    const user = getCurrentUser();
    const welcomeTitle = document.querySelector('.navbar-left h2');
    if (welcomeTitle && user) {
        // Extract first name
        const firstName = user.name.split(' ')[0];
        welcomeTitle.innerHTML = `Welcome back, <span class="text-gradient">${firstName}</span>!`;
    }
    
    document.getElementById('card-balance').textContent = formatMoney(stats.balance);
    document.getElementById('card-budget').textContent = formatMoney(stats.remainingBudget);
    document.getElementById('card-income').textContent = formatMoney(stats.totalIncome);
    document.getElementById('card-expense').textContent = formatMoney(stats.totalExpense);
    document.getElementById('card-today').textContent = formatMoney(stats.todayExpense);
    document.getElementById('card-weekly').textContent = formatMoney(stats.weeklyExpense);
    document.getElementById('card-monthly').textContent = formatMoney(stats.monthlyExpense);
    document.getElementById('card-transactions').textContent = stats.totalTransactions;

    // Warning color for negative budget
    const budgetCard = document.getElementById('card-budget');
    if (stats.remainingBudget < 0) {
        budgetCard.style.color = 'var(--danger-color)';
    } else {
        budgetCard.style.color = '';
    }

    renderRecentTransactions();
}

async function renderRecentTransactions() {
    const all = await getTransactions();
    const expenses = all.slice(0, 5); // Get top 5
    const listEl = document.getElementById('recent-transactions-list');
    
    if (expenses.length === 0) {
        listEl.innerHTML = `
            <div class="text-center text-muted" style="padding: 2rem 0; margin: auto;">
                <i class="fas fa-receipt mb-2" style="font-size: 2rem; opacity: 0.5;"></i>
                <p>No recent transactions.</p>
                <a href="expenses.html" class="btn btn-primary" style="margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.875rem;">Add One Now</a>
            </div>
        `;
        return;
    }

    let html = '';
    expenses.forEach(tx => {
        const isIncome = tx.type === 'income';
        const icon = isIncome ? 'fa-arrow-down' : 'fa-arrow-up';
        const colorClass = isIncome ? 'text-secondary' : 'text-danger';
        const sign = isIncome ? '+' : '-';
        
        // Pick an icon based on category (simplified)
        let catIcon = 'fa-tag';
        if(tx.category === 'Food') catIcon = 'fa-utensils';
        if(tx.category === 'Travel') catIcon = 'fa-car';
        if(tx.category === 'Shopping') catIcon = 'fa-shopping-bag';
        if(tx.category === 'Bills') catIcon = 'fa-file-invoice-dollar';
        if(tx.category === 'Income') catIcon = 'fa-hand-holding-dollar';

        html += `
            <div class="d-flex align-items-center justify-content-between" style="padding: 0.5rem 0; border-bottom: 1px solid var(--surface-border);">
                <div class="d-flex align-items-center gap-2">
                    <div class="btn-icon" style="background: rgba(99, 102, 241, 0.1); color: var(--primary-color);">
                        <i class="fas ${catIcon}"></i>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 0.2rem; font-size: 0.95rem;">${tx.description}</h4>
                        <p class="text-muted" style="margin-bottom: 0; font-size: 0.75rem;">${tx.date} • ${tx.category}</p>
                    </div>
                </div>
                <div style="font-weight: 600;" class="${colorClass}">
                    ${sign}${formatMoney(tx.amount)}
                </div>
            </div>
        `;
    });

    listEl.innerHTML = html;
}

async function renderMiniChart() {
    const ctx = document.getElementById('weeklyMiniChart');
    if (!ctx) return;

    const expenses = await getTransactions();
    const style = getComputedStyle(document.body);
    const primaryColor = style.getPropertyValue('--primary-color').trim();
    const surfaceBorder = style.getPropertyValue('--surface-border').trim();
    const textSecondary = style.getPropertyValue('--text-secondary').trim();

    // Generate last 7 days labels
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

        // Calculate total expense for this day
        const dayExpense = expenses
            .filter(e => e.type === 'expense' && e.date === dateStr)
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
        data.push(dayExpense);
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses',
                data: data,
                backgroundColor: primaryColor,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: surfaceBorder },
                    ticks: { color: textSecondary }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textSecondary }
                }
            }
        }
    });
}
