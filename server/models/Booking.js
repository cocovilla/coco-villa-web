const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // Assigned automatically or by admin
    checkIn: { type: Date },
    checkOut: { type: Date },
    guests: { type: Number, required: true },
    totalPrice: { type: Number },
    type: {
        type: String,
        enum: ['standard', 'long_stay_inquiry'],
        default: 'standard'
    },
    duration: { type: String },
    mealPlan: {
        type: String, // Storing name or ID, removed strict enum for dynamic plans
        default: 'Room Only'
    },
    mealPlanPrice: { type: Number, default: 0 }, // Store price at time of booking
    contactEmail: { type: String },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'inquiry', 'completed'],
        default: 'pending'
    },
    message: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
