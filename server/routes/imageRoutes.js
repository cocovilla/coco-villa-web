const express = require('express');
const router = express.Router();
const multer = require('multer');
const SiteContent = require('../models/SiteContent');
const { uploadFileToCloudinary, deleteFileFromCloudinary } = require('../services/cloudinaryService');

// Use memory storage — file goes to buffer, not disk
const upload = multer({ storage: multer.memoryStorage() });

const VALID_SECTIONS = ['hero', 'garden', 'rooms', 'experience'];

// GET images and text for a section
router.get('/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const images = await SiteContent.find({ section, imageUrl: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
        const textContent = await SiteContent.findOne({ section, content: { $exists: true } }).sort({ createdAt: -1 });

        res.json({
            images,
            textContent: textContent ? { title: textContent.title, content: textContent.content } : null
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update text content for a section
router.put('/text/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const { content, title } = req.body;

        if (!VALID_SECTIONS.includes(section)) {
            return res.status(400).json({ message: 'Invalid section' });
        }

        let textEntry = await SiteContent.findOne({ section, content: { $exists: true } });

        if (textEntry) {
            textEntry.content = content;
            textEntry.title = title;
            await textEntry.save();
        } else {
            textEntry = new SiteContent({ section, content, title });
            await textEntry.save();
        }

        res.json(textEntry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST upload image → uploads to Cloudinary
router.post('/upload/:section', upload.single('image'), async (req, res) => {
    try {
        const { section } = req.params;

        if (!VALID_SECTIONS.includes(section)) {
            return res.status(400).json({ message: 'Invalid section' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Hero: only 1 image — delete old one from Cloudinary first
        if (section === 'hero') {
            const oldContent = await SiteContent.findOne({ section: 'hero', imageUrl: { $exists: true } });
            if (oldContent) {
                await deleteFileFromCloudinary(oldContent.cloudinaryPublicId);
                await SiteContent.deleteOne({ _id: oldContent._id });
            }
        }

        // Other sections: enforce image limits
        if (['rooms', 'garden', 'experience'].includes(section)) {
            const limit = section === 'experience' ? 2 : 10;
            const count = await SiteContent.countDocuments({ section, imageUrl: { $exists: true } });
            if (count >= limit) {
                return res.status(400).json({ message: `Maximum ${limit} images allowed for ${section}.` });
            }
        }

        // Upload to Cloudinary
        const { publicId, imageUrl } = await uploadFileToCloudinary(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            section
        );

        const newContent = new SiteContent({
            section,
            imageUrl,
            cloudinaryPublicId: publicId,
        });

        await newContent.save();
        res.status(201).json(newContent);

    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE image — removes from Cloudinary and MongoDB
router.delete('/:id', async (req, res) => {
    try {
        const content = await SiteContent.findById(req.params.id);
        if (!content) return res.status(404).json({ message: 'Content not found' });

        if (content.cloudinaryPublicId) {
            await deleteFileFromCloudinary(content.cloudinaryPublicId);
        }

        await SiteContent.findByIdAndDelete(req.params.id);
        res.json({ message: 'Content deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
