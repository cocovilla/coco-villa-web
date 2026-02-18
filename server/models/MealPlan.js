const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
