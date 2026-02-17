const express = require('express');
const router = express.Router();
const { googleLogin, devLogin, getMe, sendOTP, verifyOTP } = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

router.post('/google', googleLogin);
router.post('/dev-login', devLogin); // Dev route
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', auth, getMe);

module.exports = router;
