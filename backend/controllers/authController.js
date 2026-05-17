const User = require('../models/User');

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });
        
        user = new User({ name, email, password, monthlyBudget: 3000, monthlyIncome: 5000 });
        await user.save();
        
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, settings: { theme: user.theme, currency: user.currency, monthlyIncome: user.monthlyIncome, monthlyBudget: user.monthlyBudget, onboarded: user.onboarded } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
        
        res.json({ _id: user._id, name: user.name, email: user.email, settings: { theme: user.theme, currency: user.currency, monthlyIncome: user.monthlyIncome, monthlyBudget: user.monthlyBudget, onboarded: user.onboarded } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.theme = req.body.theme || user.theme;
            user.currency = req.body.currency || user.currency;
            
            if (req.body.monthlyIncome !== undefined) user.monthlyIncome = req.body.monthlyIncome;
            if (req.body.monthlyBudget !== undefined) user.monthlyBudget = req.body.monthlyBudget;
            if (req.body.onboarded !== undefined) user.onboarded = req.body.onboarded;

            const updatedUser = await user.save();
            res.json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, settings: { theme: updatedUser.theme, currency: updatedUser.currency, monthlyIncome: updatedUser.monthlyIncome, monthlyBudget: updatedUser.monthlyBudget, onboarded: updatedUser.onboarded } });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
