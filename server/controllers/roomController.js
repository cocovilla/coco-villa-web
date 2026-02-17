const RoomType = require('../models/RoomType');
const Room = require('../models/Room');

// Get the single room type (since we only have one type "Villa")
exports.getRoomType = async (req, res) => {
    try {
        const roomType = await RoomType.findOne();
        if (!roomType) {
            return res.status(404).json({ message: 'Room type not found' });
        }
        res.json(roomType);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Initialize/Seed Room Data (Admin only or initial setup)
exports.seedRooms = async (req, res) => {
    try {
        // Check if data already exists
        const existingType = await RoomType.findOne();
        if (existingType) {
            return res.status(400).json({ message: 'Rooms already initialized' });
        }

        const roomType = new RoomType({
            title: "Deluxe Garden Villa",
            description: "A private eco-friendly villa surrounded by lush coconut gardens. Features a king-sized bed, private patio, and modern amenities.",
            images: [
                "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            amenities: ["WiFi", "AC", "Private Patio", "King Bed", "Garden View"],
            pricePerNight: 45,
            maxGuests: 3
        });
        await roomType.save();

        const rooms = [
            { name: "Villa 1", roomTypeId: roomType._id, status: 'active' },
            { name: "Villa 2", roomTypeId: roomType._id, status: 'active' }
        ];
        await Room.insertMany(rooms);

        res.json({ message: 'Rooms initialized successfully', roomType, rooms });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get availability count
exports.getAvailability = async (req, res) => {
    const { checkIn, checkOut } = req.query;
    // This will be implemented more robustly with booking logic
    // For now, return total active rooms
    try {
        const activeRooms = await Room.countDocuments({ status: 'active' });
        res.json({ available: activeRooms });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
// Update Room Type Details (Admin)
exports.updateRoomType = async (req, res) => {
    try {
        const { title, description, pricePerNight, amenities, maxGuests } = req.body;

        // Find the single room type (we assume only one for now "Villa")
        let roomType = await RoomType.findOne();

        if (!roomType) {
            return res.status(404).json({ message: 'Room type not found' });
        }

        // Update fields
        if (title) roomType.title = title;
        if (description) roomType.description = description;
        if (pricePerNight) roomType.pricePerNight = pricePerNight;
        if (amenities) roomType.amenities = amenities; // Expecting array
        if (maxGuests) roomType.maxGuests = maxGuests;

        await roomType.save();
        res.json(roomType);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
