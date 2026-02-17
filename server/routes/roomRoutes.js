const express = require('express');
const router = express.Router();
const { getRoomType, seedRooms, getAvailability, updateRoomType } = require('../controllers/roomController');
const { auth, admin } = require('../middleware/authMiddleware');

router.get('/type', getRoomType);
router.put('/type', auth, admin, updateRoomType);
router.post('/seed', admin, seedRooms); // Protected admin route
router.get('/availability', getAvailability);

module.exports = router;
