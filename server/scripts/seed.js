const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await RoomType.deleteMany({});
        await Room.deleteMany({});
        console.log('Cleared existing data');

        // Create Admin User
        const admin = new User({
            name: 'Admin User',
            email: 'madsampath94@gmail.com',
            googleId: 'admin_initial_seed',
            role: 'admin',
            avatar: 'https://via.placeholder.com/150'
        });
        await admin.save();
        console.log('Created Admin User: madsampath94@gmail.com');

        // Create Room Type
        const roomType = new RoomType({
            title: "Deluxe Garden Villa",
            description: "A private eco-friendly villa surrounded by lush coconut gardens. Features a king-sized bed, private patio, and modern amenities.",
            images: [
                "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            amenities: ["WiFi", "AC", "Private Patio", "King Bed", "Garden View", "Hot Water"],
            pricePerNight: 45,
            maxGuests: 3
        });
        await roomType.save();
        console.log('Created Room Type');

        // Create 2 Identical Rooms
        const rooms = [
            { name: "Villa 1", roomTypeId: roomType._id, status: 'active' },
            { name: "Villa 2", roomTypeId: roomType._id, status: 'active' }
        ];
        await Room.insertMany(rooms);
        console.log('Created 2 Rooms (Villa 1, Villa 2)');

        console.log('Seeding Completed Successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
