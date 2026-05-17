const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1, createdAt: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addTransaction = async (req, res) => {
    try {
        const { type, category, amount, description, date } = req.body;
        const transaction = new Transaction({
            userId: req.user._id,
            type, category, amount, description, date
        });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        await transaction.deleteOne();
        res.json({ message: 'Transaction removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        transaction.type = req.body.type || transaction.type;
        transaction.category = req.body.category || transaction.category;
        transaction.amount = req.body.amount || transaction.amount;
        transaction.description = req.body.description || transaction.description;
        transaction.date = req.body.date || transaction.date;
        await transaction.save();
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
