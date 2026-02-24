const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        enum: ['hero', 'garden', 'rooms', 'experience']
    },
    imageUrl: {
        type: String,
        required: false
    },
    cloudinaryPublicId: { // Cloudinary public_id — used for deletion
        type: String,
        required: false
    },
    content: { // For text descriptions
        type: String
    },
    title: { // Optional title
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SiteContent', siteContentSchema);

