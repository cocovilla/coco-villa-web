const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        enum: ['hero', 'garden', 'rooms', 'experience'] // Added experience
    },
    imageUrl: {
        type: String,
        required: false // Now optional for text-only content
    },
    content: { // For text descriptions
        type: String
    },
    title: { // Optional title
        type: String
    },
    publicId: { // Optional, useful if we switch to Cloudinary later, or just use filename for local
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SiteContent', siteContentSchema);
