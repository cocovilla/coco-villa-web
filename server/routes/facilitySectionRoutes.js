const express = require('express');
const router = express.Router();
const multer = require('multer');
const FacilitySection = require('../models/FacilitySection');
const { uploadFileToCloudinary, deleteFileFromCloudinary } = require('../services/cloudinaryService');

const upload = multer({ storage: multer.memoryStorage() });

const MAX_SECTIONS = 6;
const MIN_SECTIONS = 2;

// GET all sections sorted by order
router.get('/', async (req, res) => {
    try {
        const sections = await FacilitySection.find().sort({ order: 1, createdAt: 1 });
        res.json(sections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create new section (with optional image upload)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const count = await FacilitySection.countDocuments();
        if (count >= MAX_SECTIONS) {
            return res.status(400).json({ message: `Maximum ${MAX_SECTIONS} sections allowed.` });
        }

        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required.' });
        }

        let imageUrl = null;
        let cloudinaryPublicId = null;

        if (req.file) {
            const result = await uploadFileToCloudinary(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype,
                'facility_sections'
            );
            imageUrl = result.imageUrl;
            cloudinaryPublicId = result.publicId;
        }

        const section = new FacilitySection({
            title,
            description,
            imageUrl,
            cloudinaryPublicId,
            order: count
        });

        await section.save();
        res.status(201).json(section);
    } catch (err) {
        console.error('Error creating facility section:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT update section (title, description, and/or replace image)
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const section = await FacilitySection.findById(req.params.id);
        if (!section) return res.status(404).json({ message: 'Section not found' });

        const { title, description } = req.body;
        if (title) section.title = title;
        if (description) section.description = description;

        // If a new image was uploaded, replace the old one
        if (req.file) {
            if (section.cloudinaryPublicId) {
                await deleteFileFromCloudinary(section.cloudinaryPublicId);
            }
            const result = await uploadFileToCloudinary(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype,
                'facility_sections'
            );
            section.imageUrl = result.imageUrl;
            section.cloudinaryPublicId = result.publicId;
        }

        await section.save();
        res.json(section);
    } catch (err) {
        console.error('Error updating facility section:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE a section (enforces minimum 2)
router.delete('/:id', async (req, res) => {
    try {
        const count = await FacilitySection.countDocuments();
        if (count <= MIN_SECTIONS) {
            return res.status(400).json({ message: `Minimum ${MIN_SECTIONS} sections required. Cannot delete.` });
        }

        const section = await FacilitySection.findById(req.params.id);
        if (!section) return res.status(404).json({ message: 'Section not found' });

        if (section.cloudinaryPublicId) {
            await deleteFileFromCloudinary(section.cloudinaryPublicId);
        }

        await FacilitySection.findByIdAndDelete(req.params.id);
        res.json({ message: 'Section deleted successfully' });
    } catch (err) {
        console.error('Error deleting facility section:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
