const mongoose = require('mongoose');
const SiteContent = require('../models/SiteContent');
const fs = require('fs');
const path = require('path');

// Connect to DB
const MONGO_URI = "mongodb://localhost:27017/cocovilla";

mongoose.connect(MONGO_URI, {
})
    .then(() => seedData())
    .catch(err => {
        console.error("DB Error:", err);
        process.exit(1);
    });

const defaultImages = {
    hero: [
        { filename: 'hero.png', path: '../../client/public/hero.png' }
    ],
    garden: [
        { filename: 'coconut.png', path: '../../client/public/coconut.png' },
        { filename: 'path.jpg', path: '../../client/public/path.jpg' },
        { filename: 'beach.jpg', path: '../../client/public/beach.jpg' },
        { filename: 'fruit.jpeg', path: '../../client/public/fruit.jpeg' },
        { filename: 'rain.jpg', path: '../../client/public/rain.jpg' }
    ],
    rooms: [
        { filename: 'room_bed.jpg', path: '../../client/public/room_bed.jpg' },
        { filename: 'room_kitchen.jpg', path: '../../client/public/room_kitchen.jpg' },
        { filename: 'room_detail.jpg', path: '../../client/public/room_detail.jpg' }
    ]
};

const seedData = async () => {
    console.log("Starting seed...");

    try {
        for (const section in defaultImages) {
            // Check if section already has content
            const count = await SiteContent.countDocuments({ section });
            if (count > 0) {
                console.log(`Skipping ${section} (already has ${count} images)`);
                continue;
            }

            console.log(`Seeding ${section}...`);
            const images = defaultImages[section];
            const destDir = path.join(__dirname, '../public', section);

            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            for (const img of images) {
                const sourcePath = path.resolve(__dirname, img.path);
                const uniqueFilename = `seed-${Date.now()}-${img.filename}`;
                const destPath = path.join(destDir, uniqueFilename);

                if (fs.existsSync(sourcePath)) {
                    fs.copyFileSync(sourcePath, destPath);

                    await SiteContent.create({
                        section,
                        imageUrl: `/public/${section}/${uniqueFilename}`,
                        createdAt: new Date()
                    });
                    console.log(`  Added ${img.filename}`);
                } else {
                    console.warn(`  Source file not found: ${sourcePath}`);
                }
            }
        }
        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("Seed failed:", err);
        process.exit(1);
    }
};
