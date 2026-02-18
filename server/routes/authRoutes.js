const express = require('express');
const router = express.Router();
const { googleLogin, devLogin, getMe, sendOTP, verifyOTP, completeProfile } = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

router.post('/google', googleLogin);
router.post('/dev-login', devLogin); // Dev route
// Complete Profile
router.post('/complete-profile', auth, completeProfile);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', auth, getMe);

module.exports = router;
