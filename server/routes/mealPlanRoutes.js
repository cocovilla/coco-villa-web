const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');

// Helper to format names (e.g., "Bed & Breakfast" -> "bed_and_breakfast")
// We might not need this if we store display names and IDs directly
// but existing code uses "bed_and_breakfast" keys.
// For now, let's just store the whole object and refactor frontend to use IDs if needed,
// OR we can add a 'slug' field to MealPlan if we want to keep string keys.
// Let's stick to using the _id for new logic, but maybe support a 'slug' for backward compat?
// Actually, strict ID usage is better. I will update frontend to use IDs.

// GET all active meal plans
router.get('/', async (req, res) => {
    try {
        const plans = await MealPlan.find({ isActive: true });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new meal plan
router.post('/', async (req, res) => {
    try {
        if (req.body.isDefault) {
            await MealPlan.updateMany({}, { isDefault: false });
        }
        const newPlan = new MealPlan(req.body);
        const savedPlan = await newPlan.save();
        res.status(201).json(savedPlan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all meal plans (Admin)
router.get('/admin/all', async (req, res) => {
    try {
        const plans = await MealPlan.find().sort({ createdAt: -1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Update meal plan
router.put('/:id', async (req, res) => {
    try {
        if (req.body.isDefault) {
            await MealPlan.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
        }
        const updatedPlan = await MealPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPlan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE meal plan (Soft delete preferred usually, but let's allow hard delete for now or toggle active)
router.delete('/:id', async (req, res) => {
    try {
        await MealPlan.findByIdAndDelete(req.params.id);
        res.json({ message: "Meal plan deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
