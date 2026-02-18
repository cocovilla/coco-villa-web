const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String
    },
    country: {
        type: String
    },
    contactNumber: {
        type: String
    },
    password: {
        type: String,
        select: false // Not returned by default queries
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
