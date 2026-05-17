const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const seedDemoAccount = async () => {
    try {
        const demoEmail = 'demo@gmail.com';
        let demoUser = await User.findOne({ email: demoEmail });

        if (demoUser) {
            console.log('Demo account already exists. Skipping seed.');
            return;
        }

        console.log('Seeding demo account...');
        demoUser = new User({
            name: 'Demo User',
            email: demoEmail,
            password: 'demo123',
            monthlyIncome: 8000,
            monthlyBudget: 3000,
            currency: '$',
            theme: 'dark',
            onboarded: true
        });
        await demoUser.save();

        const transactions = [];
        const now = new Date();
        const getDateDaysAgo = (days) => {
            const d = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
            return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        };

        // Income
        transactions.push({ userId: demoUser._id, type: 'income', amount: 5000, category: 'Salary', description: 'Monthly Salary', date: getDateDaysAgo(25) });
        transactions.push({ userId: demoUser._id, type: 'income', amount: 1500, category: 'Freelancing', description: 'Web Design Project', date: getDateDaysAgo(15) });
        transactions.push({ userId: demoUser._id, type: 'income', amount: 800, category: 'Bonus', description: 'Performance Bonus', date: getDateDaysAgo(5) });

        // Weekly Pattern
        for (let i = 0; i < 14; i++) {
            const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            const day = d.getDay();
            let amount = 20;
            let cat = 'Food';
            let desc = 'Daily Expense';
            
            if (day === 1) { amount = 15; cat = 'Travel'; desc = 'Commute'; }
            else if (day === 2) { amount = 35; cat = 'Food'; desc = 'Lunch out'; }
            else if (day === 3) { amount = 45; cat = 'Bills'; desc = 'Subscriptions'; }
            else if (day === 4) { amount = 50; cat = 'Shopping'; desc = 'Groceries'; }
            else if (day === 5) { amount = 95; cat = 'Entertainment'; desc = 'Friday Night out'; }
            else if (day === 6) { amount = 160; cat = 'Shopping'; desc = 'Weekend Shopping'; }
            else if (day === 0) { amount = 85; cat = 'Food'; desc = 'Sunday Brunch'; }
            
            amount = amount + (Math.random() * 10 - 5);
            transactions.push({ userId: demoUser._id, type: 'expense', amount: parseFloat(amount.toFixed(2)), category: cat, description: desc, date: getDateDaysAgo(i) });
        }

        // Monthly Historical
        const historicalData = [
            { month: 11, year: 2025, amount: 1200 },
            { month: 0, year: 2026, amount: 1600 },
            { month: 1, year: 2026, amount: 1850 },
            { month: 2, year: 2026, amount: 2100 },
            { month: 3, year: 2026, amount: 2350 },
            { month: 4, year: 2026, amount: 1760 }
        ];

        historicalData.forEach(data => {
            const d = new Date(data.year, data.month, 10);
            const dateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            
            transactions.push({ userId: demoUser._id, type: 'expense', amount: parseFloat((data.amount * 0.4).toFixed(2)), category: 'Bills', description: 'Monthly Rent', date: dateStr });
            transactions.push({ userId: demoUser._id, type: 'expense', amount: parseFloat((data.amount * 0.3).toFixed(2)), category: 'Food', description: 'Groceries', date: dateStr });
            transactions.push({ userId: demoUser._id, type: 'expense', amount: parseFloat((data.amount * 0.3).toFixed(2)), category: 'Shopping', description: 'Shopping', date: dateStr });
            transactions.push({ userId: demoUser._id, type: 'income', amount: 5000, category: 'Salary', description: 'Salary', date: dateStr });
        });

        await Transaction.insertMany(transactions);
        console.log('Demo account seeded successfully.');
    } catch (err) {
        console.error('Error seeding demo account:', err);
    }
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');
        await seedDemoAccount();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
