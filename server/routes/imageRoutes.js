const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SiteContent = require('../models/SiteContent');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const section = req.params.section;
        const validSections = ['hero', 'garden', 'rooms', 'experience'];

        if (!validSections.includes(section)) {
            return cb(new Error('Invalid section'), false);
        }

        const uploadPath = path.join(__dirname, '../public', section);

        // Ensure directory exists (though we created them, good safety)
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Use timestamp to avoid cache issues and collisions
        // For hero, we might want a fixed name, but simple timestamp is better for cache busting
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// GET images and text for a section
router.get('/:section', async (req, res) => {
    try {
        const { section } = req.params;

        // Fetch images (where imageUrl exists)
        const images = await SiteContent.find({ section, imageUrl: { $exists: true, $ne: null } }).sort({ createdAt: -1 });

        // Fetch text content (where content exists)
        // We assume one text entry per section for simplicity, or we can just return the array
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

        const validSections = ['hero', 'garden', 'rooms', 'experience'];
        if (!validSections.includes(section)) {
            return res.status(400).json({ message: 'Invalid section' });
        }

        // Find existing text entry or create new
        let textEntry = await SiteContent.findOne({ section, content: { $exists: true } });

        if (textEntry) {
            textEntry.content = content;
            textEntry.title = title;
            await textEntry.save();
        } else {
            textEntry = new SiteContent({
                section,
                content,
                title
            });
            await textEntry.save();
        }

        res.json(textEntry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST upload new image
router.post('/upload/:section', upload.single('image'), async (req, res) => {
    try {
        const { section } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Construct public URL (assuming server serves 'public' at root or specific path)
        // We will configure Main server to serve 'public' at '/public'
        const imageUrl = `/public/${section}/${req.file.filename}`;

        // Logic per section
        if (section === 'hero') {
            // Hero: Only 1 image allowed. Remove old ones.
            const oldContent = await SiteContent.findOne({ section: 'hero', imageUrl: { $exists: true } });
            if (oldContent) {
                try {
                    const oldPath = path.join(__dirname, '..', oldContent.imageUrl);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                } catch (e) {
                    console.error("Failed to delete old hero image", e);
                }
                await SiteContent.deleteOne({ _id: oldContent._id });
            }
        }

        if (section === 'rooms' || section === 'garden' || section === 'experience') {
            // Max images limit (2 for experience, 10 for others)
            const limit = section === 'experience' ? 2 : 10;
            const count = await SiteContent.countDocuments({ section, imageUrl: { $exists: true } });

            if (count >= limit) {
                // Clean up the uploaded file since we reject
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ message: `Maximum ${limit} images allowed for ${section}.` });
            }
        }

        const newContent = new SiteContent({
            section,
            imageUrl
        });

        await newContent.save();
        res.status(201).json(newContent);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE image
router.delete('/:id', async (req, res) => {
    try {
        const content = await SiteContent.findById(req.params.id);
        if (!content) return res.status(404).json({ message: 'Content not found' });

        // Only delete file if it's an image
        if (content.imageUrl) {
            try {
                const filePath = path.join(__dirname, '..', content.imageUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                console.error("Error deleting file:", e);
            }
        }

        await SiteContent.findByIdAndDelete(req.params.id);
        res.json({ message: 'Content deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
