const Transaction = require('../models/Transaction');

exports.getAnalytics = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id });
        
        const now = new Date();
        const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const startOfWeekObj = new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000));
        const startOfWeek = new Date(startOfWeekObj.getTime() - (startOfWeekObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const startOfMonthObj = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfMonth = new Date(startOfMonthObj.getTime() - (startOfMonthObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        let totalIncome = 0;
        let totalExpense = 0;
        let todayExpense = 0;
        let weeklyExpense = 0;
        let monthlyExpense = 0;
        const catTotals = {};

        transactions.forEach(t => {
            const amount = parseFloat(t.amount);
            if (t.type === 'income') {
                totalIncome += amount;
            } else {
                totalExpense += amount;
                if (t.date === today) todayExpense += amount;
                if (t.date >= startOfWeek) weeklyExpense += amount;
                if (t.date >= startOfMonth) monthlyExpense += amount;
                catTotals[t.category] = (catTotals[t.category] || 0) + amount;
            }
        });

        res.json({
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            todayExpense,
            weeklyExpense,
            monthlyExpense,
            budgetGoal: req.user.monthlyBudget,
            remainingBudget: req.user.monthlyBudget - monthlyExpense,
            catTotals
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
