/**
 * Analytics Logic
 * Uses Chart.js to render complex charts based on mock data.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    Chart.defaults.color = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim();
    Chart.defaults.font.family = getComputedStyle(document.body).getPropertyValue('--font-family').trim();

    let trendChartInstance = null;
    let categoryChartInstance = null;
    let ieChartInstance = null;

    async function renderCharts() {
        const expenses = await getTransactions();
        const style = getComputedStyle(document.body);
        
        const primary = style.getPropertyValue('--primary-color').trim();
        const secondary = style.getPropertyValue('--secondary-color').trim();
        const danger = style.getPropertyValue('--danger-color').trim();
        const warning = style.getPropertyValue('--warning-color').trim();
        const info = style.getPropertyValue('--info-color').trim();
        const surfaceBorder = style.getPropertyValue('--surface-border').trim();

        // 1. Trend Chart
        const trendFilter = document.getElementById('trend-filter').value;
        const trendCtx = document.getElementById('trendChart');
        
        let trendLabels = [];
        let trendData = [];
        let isMonthly = trendFilter === 'monthly';

        if (isMonthly) {
            // Last 6 months
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                trendLabels.push(monthNames[d.getMonth()]);
                
                const monthExpenses = expenses
                    .filter(e => e.type === 'expense' && new Date(e.date).getMonth() === d.getMonth())
                    .reduce((sum, e) => sum + parseFloat(e.amount), 0);
                trendData.push(monthExpenses);
            }
        } else {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                trendLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
                
                const dateStr = d.toISOString().split('T')[0];
                const dayExpense = expenses
                    .filter(e => e.type === 'expense' && e.date === dateStr)
                    .reduce((sum, e) => sum + parseFloat(e.amount), 0);
                trendData.push(dayExpense);
            }
        }

        const chartContainer = trendCtx.parentElement;
        chartContainer.style.transition = 'opacity 0.3s ease';
        chartContainer.style.opacity = '0';

        setTimeout(() => {
            if (trendChartInstance) trendChartInstance.destroy();
            trendChartInstance = new Chart(trendCtx, {
                type: isMonthly ? 'line' : 'bar',
                data: {
                    labels: trendLabels,
                    datasets: [{
                        label: 'Expenses',
                        data: trendData,
                        backgroundColor: isMonthly ? 'rgba(99, 102, 241, 0.15)' : primary,
                        borderColor: primary,
                        borderWidth: isMonthly ? 3 : 0,
                        fill: isMonthly,
                        tension: 0.4, // Smooth curve for area chart
                        borderRadius: isMonthly ? 0 : 6,
                        pointBackgroundColor: primary,
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: primary,
                        pointRadius: isMonthly ? 4 : 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { grid: { color: surfaceBorder }, beginAtZero: true },
                        x: { grid: { display: false } }
                    }
                }
            });
            chartContainer.style.opacity = '1';
        }, 300);

        // 2. Category Chart (Doughnut)
        const catCtx = document.getElementById('categoryChart');
        const catTotals = {};
        
        expenses.filter(e => e.type === 'expense').forEach(e => {
            catTotals[e.category] = (catTotals[e.category] || 0) + parseFloat(e.amount);
        });

        if (categoryChartInstance) categoryChartInstance.destroy();
        categoryChartInstance = new Chart(catCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(catTotals),
                datasets: [{
                    data: Object.values(catTotals),
                    backgroundColor: [primary, warning, danger, info, secondary, '#8b5cf6', '#ec4899'],
                    borderWidth: 2,
                    borderColor: getComputedStyle(document.body).getPropertyValue('--glass-bg').trim()
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) label += ': ';
                                const total = context.chart._metasets[context.datasetIndex].total;
                                const value = context.raw;
                                const percentage = Math.round((value / total) * 100) + '%';
                                return label + formatMoney(value) + ' (' + percentage + ')';
                            }
                        }
                    }
                }
            }
        });

        // 3. Income vs Expense (Pie)
        const ieCtx = document.getElementById('incomeExpenseChart');
        const stats = await getSummaryStats() || { totalIncome: 0, totalExpense: 0, remainingBudget: 0, budgetGoal: 0, balance: 0 };
        
        if (ieChartInstance) ieChartInstance.destroy();
        ieChartInstance = new Chart(ieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [{
                    data: [stats.totalIncome, stats.totalExpense],
                    backgroundColor: [secondary, danger],
                    borderWidth: 2,
                    borderColor: getComputedStyle(document.body).getPropertyValue('--glass-bg').trim()
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        // 4. Update Analytics Insight Cards
        const topCat = Object.keys(catTotals).length > 0 ? Object.keys(catTotals).reduce((a, b) => catTotals[a] > catTotals[b] ? a : b) : '-';
        document.getElementById('insight-top-cat').textContent = topCat;

        const maxExp = expenses.filter(e => e.type === 'expense').reduce((max, e) => parseFloat(e.amount) > max ? parseFloat(e.amount) : max, 0);
        document.getElementById('insight-max-exp').textContent = formatMoney(maxExp);

        const savingsAmt = stats.totalIncome - stats.totalExpense;
        const savingsPct = stats.totalIncome > 0 ? Math.round((savingsAmt / stats.totalIncome) * 100) : 0;
        document.getElementById('insight-savings-pct').textContent = savingsPct + '%';

        const budgetEl = document.getElementById('insight-budget-status');
        if (stats.remainingBudget < 0) {
            budgetEl.textContent = 'Exceeded';
            budgetEl.style.color = danger;
        } else if (stats.remainingBudget < stats.budgetGoal * 0.2) {
            budgetEl.textContent = 'Near Limit';
            budgetEl.style.color = warning;
        } else {
            budgetEl.textContent = 'On Track';
            budgetEl.style.color = secondary;
        }

        // 5. Update Income vs Expense Breakdown
        document.getElementById('ie-savings').textContent = formatMoney(savingsAmt);
        const expRatio = stats.totalIncome > 0 ? Math.round((stats.totalExpense / stats.totalIncome) * 100) : 0;
        document.getElementById('ie-ratio').textContent = expRatio + '%';
        document.getElementById('ie-remaining').textContent = formatMoney(stats.balance);

        // 6. Smart Financial Insights
        const insightsList = document.getElementById('smart-insights-list');
        let insightsHtml = '';

        if (topCat !== '-') {
            const topCatPct = Math.round((catTotals[topCat] / stats.totalExpense) * 100);
            insightsHtml += `<li><strong>${topCat}</strong> accounts for <strong>${topCatPct}%</strong> of total expenses.</li>`;
        }
        
        if (stats.remainingBudget >= 0) {
            insightsHtml += `<li>You stayed within your monthly budget. Good job!</li>`;
        } else {
            insightsHtml += `<li>You have exceeded your monthly budget by ${formatMoney(Math.abs(stats.remainingBudget))}.</li>`;
        }

        if (!isMonthly && trendData.length > 0) {
            let maxDayIdx = 0;
            let maxDayVal = 0;
            trendData.forEach((val, idx) => {
                if (val > maxDayVal) {
                    maxDayVal = val;
                    maxDayIdx = idx;
                }
            });
            if (maxDayVal > 0) {
                insightsHtml += `<li>Highest spending this week occurred on <strong>${trendLabels[maxDayIdx]}</strong>.</li>`;
            }
        } else if (isMonthly && trendData.length >= 2) {
            const thisMonth = trendData[trendData.length - 1];
            const lastMonth = trendData[trendData.length - 2];
            if (lastMonth > 0) {
                const diff = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
                if (diff > 0) {
                    insightsHtml += `<li>Spending increased by <strong>${diff}%</strong> compared to last month.</li>`;
                } else if (diff < 0) {
                    insightsHtml += `<li>Spending decreased by <strong>${Math.abs(diff)}%</strong> compared to last month.</li>`;
                } else {
                    insightsHtml += `<li>Spending is the same as last month.</li>`;
                }
            }
        }

        insightsList.innerHTML = insightsHtml;
    }

    // Initial render
    renderCharts();

    // Event listener for filter change
    document.getElementById('trend-filter').addEventListener('change', renderCharts);

    // Re-render charts on theme change to update font/grid colors
    document.getElementById('theme-toggle').addEventListener('click', () => {
        setTimeout(renderCharts, 300); // Wait for transition
    });
});
