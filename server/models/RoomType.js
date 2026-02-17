const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    amenities: [{ type: String }],
    pricePerNight: { type: Number, required: true },
    maxGuests: { type: Number, default: 2 }
});

module.exports = mongoose.model('RoomType', roomTypeSchema);
