const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const { sendWhatsApp } = require('../services/whatsappService');

// Helper: Check Availability
const checkRoomAvailability = async (checkIn, checkOut, excludeBookingId = null) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    // Find any booking that overlaps with the requested dates and is confirmed
    // Overlap logic: (StartA < EndB) and (EndA > StartB)
    const query = {
        status: 'confirmed',
        $or: [
            { checkIn: { $lt: end }, checkOut: { $gt: start } }
        ]
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const existingBooking = await Booking.findOne(query);
    return !existingBooking; // Returns true if available, false if overlapping
};

// Public: Check Availability Endpoint
exports.checkAvailability = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;
        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: 'Please provide checkIn and checkOut dates' });
        }

        const isAvailable = await checkRoomAvailability(checkIn, checkOut);
        res.json({ available: isAvailable });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create Booking (User) or Long Stay Inquiry
exports.createBooking = async (req, res) => {
    try {
        const { roomTypeId, checkIn, checkOut, guests, totalPrice, message, type, email } = req.body;
        const userId = req.user.id;

        // Fetch user details for email notifications
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Long Stay Inquiry Handling
        if (type === 'long_stay_inquiry') {
            // Create Inquiry Record
            const inquiry = new Booking({
                userId,
                roomTypeId,
                guests,
                type: 'long_stay_inquiry',
                duration: req.body.duration,
                contactEmail: email,
                message: message || 'No message',
                status: 'inquiry'
            });

            await inquiry.save();

            // Send Email to Admin
            await sendEmail(
                'admin@cocovilla.com', // Replace with actual admin email or env var
                'New Long Stay Inquiry',
                `User: ${user.name} (${user.email})
                 Contact Email: ${email}
                 Guests: ${guests}
                 Duration: ${req.body.duration}
                 Message: ${message || 'No message'}
                 
                 This user is requesting a quotation for a long stay (1 month - 2 years).`
            );

            // Send Confirmation to User
            await sendEmail(
                email,
                'Inquiry Received - Coco Villa',
                `Dear ${req.user.name},\n\nWe have received your request for a long stay quotation. Our team will review your requirements and get back to you within 24 hours with a personalized offer.\n\nBest Regards,\nCoco Villa Team`
            );

            // Notification (WhatsApp)
            await sendWhatsApp(process.env.ADMIN_PHONE_NUMBER, `Long Stay Inquiry from ${req.user.name}. Check email.`);

            return res.status(200).json({ message: 'Inquiry sent successfully', booking: inquiry });
        }

        // Standard Booking Validation
        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: 'Check-in and Check-out dates are required for standard bookings.' });
        }

        // Check availability before creating
        const isAvailable = await checkRoomAvailability(checkIn, checkOut);
        if (!isAvailable) {
            return res.status(400).json({ message: 'Selected dates are not available.' });
        }

        const booking = new Booking({
            userId,
            roomTypeId,
            checkIn,
            checkOut,
            guests,
            totalPrice,
            message,
            status: 'pending'
        });

        await booking.save();

        // Notifications
        await sendEmail(user.email, 'Booking Received - Pending Approval', 'Your booking request has been received.');
        await sendWhatsApp(process.env.ADMIN_PHONE_NUMBER, `New Booking Request from ${user.name}`);

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// User: Cancel Booking
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify ownership
        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot cancel a completed or already cancelled booking' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Notify Admin (optional, but good practice)
        if (booking.type !== 'long_stay_inquiry') {
            const user = await User.findById(req.user.id);
            await sendEmail(
                'admin@cocovilla.com',
                'Booking Cancelled by User',
                `Booking ID: ${booking._id}\nUser: ${user.name}\nCheck-in: ${new Date(booking.checkIn).toLocaleDateString()}`
            );
        }

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get User Bookings
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('roomId')
            .populate('roomTypeId')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Get All Bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('userId').populate('roomId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Update Status (Approve/Reject)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'confirmed', 'rejected', 'cancelled'
        const booking = await Booking.findById(req.params.id).populate('userId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // If confirming, check availability again to be safe
        if (status === 'confirmed' && booking.status !== 'confirmed') {
            const isAvailable = await checkRoomAvailability(booking.checkIn, booking.checkOut, booking._id);
            if (!isAvailable) {
                return res.status(400).json({ message: 'Cannot confirm: Dates are no longer available.' });
            }

            // Assign a room if not assigned
            if (!booking.roomId) {
                const room = await Room.findOne({ status: 'active' });
                if (room) booking.roomId = room._id;
            }
        }

        booking.status = status;
        await booking.save();

        // Notify User
        const subject = status === 'confirmed' ? 'Booking Confirmed!' : 'Booking Update';
        if (booking.userId && booking.userId.email) {
            await sendEmail(booking.userId.email, subject, `Your booking status is now: ${status}`);
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin: Manual Block Dates
exports.blockDates = async (req, res) => {
    try {
        const { checkIn, checkOut, reason } = req.body;

        // Check availability
        const isAvailable = await checkRoomAvailability(checkIn, checkOut);
        if (!isAvailable) {
            return res.status(400).json({ message: 'Dates are already booked/blocked.' });
        }

        const roomType = await require('../models/RoomType').findOne();

        // Create a "confirmed" booking to block the dates
        // We can use a special system user ID or just make userId optional in model if strict, 
        // but for now let's assume req.user.id (admin) is fine or we create a "Block" record.
        // Re-using Booking model for simplicity as requested.
        const booking = new Booking({
            userId: req.user.id, // Admin own booking
            roomTypeId: roomType?._id,
            checkIn,
            checkOut,
            guests: 0,
            totalPrice: 0,
            status: 'confirmed',
            message: `Manual Block: ${reason || 'Admin Blocked'}`
        });

        await booking.save();
        res.status(201).json({ message: 'Dates blocked successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin: Get Blocked Dates
exports.getBlockedDates = async (req, res) => {
    try {
        // blocked dates are identified by guests: 0 and totalPrice: 0 (or specific message pattern)
        const blocks = await Booking.find({ guests: 0, totalPrice: 0 }).sort({ checkIn: 1 });
        res.json(blocks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin: Delete Blocked Date
exports.deleteBlockedDate = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Block not found' });
        }
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Block removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin: Update Blocked Date
exports.updateBlockedDate = async (req, res) => {
    try {
        const { checkIn, checkOut, reason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Block not found' });
        }

        // Check availability (excluding current booking)
        const isAvailable = await checkRoomAvailability(checkIn, checkOut, booking._id);
        if (!isAvailable) {
            return res.status(400).json({ message: 'New dates are not available.' });
        }

        booking.checkIn = checkIn;
        booking.checkOut = checkOut;
        booking.message = `Manual Block: ${reason || 'Admin Blocked'}`;

        await booking.save();
        res.json({ message: 'Block updated successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Public: Get All Unavailable Dates (Confirmed Bookings + Blocked Dates)
exports.getUnavailableDates = async (req, res) => {
    try {
        // Fetch confirmed bookings
        const bookings = await Booking.find({ status: 'confirmed' }).select('checkIn checkOut');

        // Fetch blocked dates (guests: 0, totalPrice: 0) - or if you separate models, fetch there
        // Assuming Blocked Dates are Bookings with specific criteria as per existing logic
        // const blocked = await Booking.find({ guests: 0, totalPrice: 0 }).select('checkIn checkOut');
        // Actually, the above query is a subset of 'confirmed', but let's be explicit if needed or just rely on 'confirmed'.
        // Since blocked dates are saved as 'confirmed' bookings, the first query covers both.

        const unavailableDates = bookings.map(b => ({
            start: b.checkIn,
            end: b.checkOut
        }));

        res.json(unavailableDates);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
