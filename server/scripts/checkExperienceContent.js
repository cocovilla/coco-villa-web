const mongoose = require('mongoose');
const SiteContent = require('../models/SiteContent');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkContent = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const experienceImages = await SiteContent.find({ section: 'experience', imageUrl: { $exists: true } });
        console.log(`Found ${experienceImages.length} experience images:`);
        experienceImages.forEach(img => console.log(`- ID: ${img._id}, URL: ${img.imageUrl}`));

        const experienceText = await SiteContent.findOne({ section: 'experience', content: { $exists: true } });
        console.log('Experience Text:', experienceText ? experienceText.content : 'None');

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkContent();
