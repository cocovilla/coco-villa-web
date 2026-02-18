require('dotenv').config({ path: 'server/.env' });
const mongoose = require('mongoose');
const Facility = require('../models/Facility');

const facilities = [
    {
        icon: 'Wifi',
        title: "High-Speed WiFi",
        description: "Fiber optic connection throughout the property."
    },
    {
        icon: 'BedDouble',
        title: "Luxury King Beds",
        description: "Premium linens for a restful sleep."
    },
    {
        icon: 'Tv',
        title: "Smart Entertainment",
        description: "Satellite TV & Streaming apps."
    },
    {
        icon: 'ParkingCircle',
        title: "Secure Parking",
        description: "Free on-site parking for guests."
    },
    {
        icon: 'Plane',
        title: "Airport Transfers",
        description: "Hassle-free pickup and drop-off (On request)."
    },
    {
        icon: 'ShieldCheck',
        title: "24/7 Security",
        description: "CCTV and night security guard."
    },
    {
        icon: 'Car',
        title: "Tour Arrangements",
        description: "Day trips to Galle Fort, Mirissa, and more."
    },
    {
        icon: 'Dumbbell',
        title: "Wellness & Yoga",
        description: "Mats available and massage on call."
    },
    {
        icon: 'Sparkles',
        title: "Daily Housekeeping",
        description: "Fresh towels and cleaning service."
    }
];

const seedFacilities = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing facilities to avoid duplicates
        await Facility.deleteMany({});
        console.log('Cleared existing facilities');

        await Facility.insertMany(facilities);
        console.log('Added default facilities');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedFacilities();
