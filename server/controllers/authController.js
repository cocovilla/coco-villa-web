const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendEmail } = require('../services/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, sub: googleId, picture } = ticket.getPayload();

        let user = await User.findOne({ googleId });

        if (!user) {
            // Check if user exists with same email (optional linking)
            user = await User.findOne({ email });
            if (user) {
                user.googleId = googleId;
                user.avatar = picture;
                await user.save();
            } else {
                user = new User({
                    name,
                    email,
                    googleId,
                    avatar: picture,
                    role: 'user'
                });
                await user.save();
            }
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            token: jwtToken
        });

    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(400).json({ message: 'Google login failed', error: error.message });
    }
};

// DEV ONLY: Login without Google
exports.devLogin = async (req, res) => {
    const { email, role, name } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name: name || 'Test User',
                email,
                googleId: `dev_${Date.now()}`,
                role: role || 'user',
                avatar: 'https://via.placeholder.com/150'
            });
            await user.save();
        }

        const jwtToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            token: jwtToken
        });
    } catch (error) {
        console.error("Dev Login Error", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-googleId');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Send OTP
exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB (expires in 10 mins)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Delete existing OTPs for this email
        await OTP.deleteMany({ email });

        await OTP.create({ email, code, expiresAt });

        // Send Email
        await sendEmail(email, 'Your Verification Code', `Your booking verification code is: ${code}`);

        res.json({ message: 'Verification code sent to email' });
    } catch (error) {
        console.error("Send OTP Error", error);
        res.status(500).json({ message: 'Server error sending OTP' });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    const { email, code, name } = req.body;
    try {
        const otpRecord = await OTP.findOne({ email, code });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        // Code is valid. Find or create user.
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name: name || 'Guest User',
                email,
                role: 'user',
                googleId: `email_${Date.now()}`, // Placeholder to satisfy unique constraint if needed, or make sure schema allows null
                avatar: 'https://via.placeholder.com/150'
            });
            await user.save();
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Delete used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            token: jwtToken
        });

    } catch (error) {
        console.error("Verify OTP Error", error);
        res.status(500).json({ message: 'Server error verifying OTP' });
    }
};
