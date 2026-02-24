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

// Indexes for query performance
// Covers checkRoomAvailability: Booking.findOne({ status, checkIn, checkOut })
bookingSchema.index({ status: 1, checkIn: 1, checkOut: 1 });
// Covers getMyBookings: Booking.find({ userId })
bookingSchema.index({ userId: 1 });
// Covers getAllBookings sort: .sort({ createdAt: -1 })
bookingSchema.index({ createdAt: -1 });
// Covers getBlockedDates: Booking.find({ guests: 0, totalPrice: 0 })
bookingSchema.index({ guests: 1, totalPrice: 1 });


module.exports = mongoose.model('Booking', bookingSchema);
