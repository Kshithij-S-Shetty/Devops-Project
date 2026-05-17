const User = require('../models/User');

const protect = async (req, res, next) => {
    let userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ message: 'Not authorized, no user id provided' });
    }
    try {
        req.user = await User.findById(userId);
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};

module.exports = protect;
