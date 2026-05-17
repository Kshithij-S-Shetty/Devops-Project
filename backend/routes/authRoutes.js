const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateSettings } = require('../controllers/authController');
const protect = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/settings', protect, updateSettings);

module.exports = router;
