const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
// const { protect, admin } = require('../middleware/authMiddleware'); // Assuming auth middleware exists

// @desc    Get all facilities
// @route   GET /api/facilities
// @access  Public
router.get('/', async (req, res) => {
    try {
        const facilities = await Facility.find(); // Sort by newest? .sort({ createdAt: -1 });
        res.json(facilities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Create a facility
// @route   POST /api/facilities
// @access  Private/Admin
router.post('/', async (req, res) => {
    const { title, description, icon, isImportant } = req.body;

    const facility = new Facility({
        title,
        description,
        icon,
        isImportant: isImportant || false
    });

    try {
        const newFacility = await facility.save();
        res.status(201).json(newFacility);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc    Update a facility
// @route   PUT /api/facilities/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);

        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }

        facility.title = req.body.title || facility.title;
        facility.description = req.body.description || facility.description;
        facility.icon = req.body.icon || facility.icon;
        if (req.body.isImportant !== undefined) {
            facility.isImportant = req.body.isImportant;
        }

        const updatedFacility = await facility.save();
        res.json(updatedFacility);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc    Delete a facility
// @route   DELETE /api/facilities/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);

        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }

        await facility.deleteOne();
        res.json({ message: 'Facility removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
