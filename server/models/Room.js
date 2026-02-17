const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Villa 1"
    roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    status: { type: String, enum: ['active', 'maintenance'], default: 'active' }
});

module.exports = mongoose.model('Room', roomSchema);
