const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String, // Storing icon name (e.g., 'Wifi', 'Pool')
        required: true
    },
    isImportant: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Facility', facilitySchema);
