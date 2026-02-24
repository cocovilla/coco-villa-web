require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const path = require('path');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const imageRoutes = require('./routes/imageRoutes'); // [NEW]

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Keep-alive ping – hit this every 5 min to prevent Railway cold starts
app.get('/ping', (req, res) => res.json({ status: 'ok', ts: Date.now() }));



// Serve Static Files (Images) [NEW]
app.use('/public', express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+ but harmless
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/images', imageRoutes); // [NEW]
app.use('/api/facilities', require('./routes/facilityRoutes')); // [NEW Facilities]
app.use('/api/meal-plans', require('./routes/mealPlanRoutes')); // [NEW Meal Plans]
app.use('/api/facility-sections', require('./routes/facilitySectionRoutes')); // [NEW Facility Sections]

// Basic Route
app.get('/', (req, res) => {
    res.send('Villa Booking API running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
