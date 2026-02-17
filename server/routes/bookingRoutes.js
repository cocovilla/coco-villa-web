const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings, updateBookingStatus, checkAvailability, blockDates, getBlockedDates, deleteBlockedDate, updateBlockedDate } = require('../controllers/bookingController');
const { auth, admin } = require('../middleware/authMiddleware');

// Public
router.get('/check-availability', checkAvailability);

router.post('/', auth, createBooking);
router.get('/my', auth, getMyBookings);

// Admin Routes
router.get('/all', auth, admin, getAllBookings);
router.put('/:id/status', auth, admin, updateBookingStatus);
router.get('/admin/blocks', auth, admin, getBlockedDates);
router.post('/admin/block', auth, admin, blockDates);
router.put('/admin/block/:id', auth, admin, updateBlockedDate);
router.delete('/admin/block/:id', auth, admin, deleteBlockedDate);

module.exports = router;
