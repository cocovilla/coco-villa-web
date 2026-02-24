/**
 * syncFromCloudinary.js
 *
 * Scans Cloudinary folders under cocovilla/web_images/<section>/
 * and creates SiteContent entries in MongoDB for any images not already tracked.
 *
 * Run once after manually uploading images to Cloudinary:
 *   node scripts/syncFromCloudinary.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const SiteContent = require('../models/SiteContent');
const { listFilesInSection } = require('../services/cloudinaryService');

const SECTIONS = ['hero', 'garden', 'rooms', 'experience'];

async function syncSection(section) {
    console.log(`\n📁 Scanning section: ${section}`);

    const files = await listFilesInSection(section);
    console.log(`  Found ${files.length} file(s) on Cloudinary`);

    let added = 0;
    let skipped = 0;

    for (const file of files) {
        const existing = await SiteContent.findOne({ cloudinaryPublicId: file.publicId });

        if (existing) {
            console.log(`  ⏭  Already in DB: ${file.publicId}`);
            skipped++;
            continue;
        }

        await SiteContent.create({
            section,
            imageUrl: file.imageUrl,
            cloudinaryPublicId: file.publicId,
        });

        console.log(`  ✅ Added: ${file.publicId}`);
        added++;
    }

    console.log(`  Done: ${added} added, ${skipped} skipped`);
}

async function main() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected\n');

        for (const section of SECTIONS) {
            await syncSection(section);
        }

        console.log('\n🎉 Sync complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err.message);
        process.exit(1);
    }
}

main();
