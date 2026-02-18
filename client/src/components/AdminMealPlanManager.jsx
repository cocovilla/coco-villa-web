import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, Edit2, Plus, Utensils, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminMealPlanManager = () => {
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        description: '',
        description: '',
        isActive: true,
        isDefault: false
    });

    useEffect(() => {
        fetchMealPlans();
    }, []);

    const fetchMealPlans = async () => {
        try {
            const res = await api.get('/meal-plans/admin/all');
            setMealPlans(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch meal plans", err);
            toast.error("Failed to load meal plans");
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/meal-plans/${editingId}`, formData);
                toast.success("Meal plan updated successfully");
            } else {
                await api.post('/meal-plans', formData);
                toast.success("Meal plan added successfully");
            }
            fetchMealPlans();
            resetForm();
        } catch (err) {
            console.error("Error saving meal plan", err);
            toast.error("Failed to save meal plan");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this meal plan?")) return;
        try {
            await api.delete(`/meal-plans/${id}`);
            toast.success("Meal plan deleted");
            setMealPlans(mealPlans.filter(p => p._id !== id));
        } catch (err) {
            console.error("Error deleting meal plan", err);
            toast.error("Failed to delete meal plan");
        }
    };

    const handleEdit = (plan) => {
        setEditingId(plan._id);
        setFormData({
            name: plan.name,
            price: plan.price,
            description: plan.description || '',
            description: plan.description || '',
            isActive: plan.isActive,
            isDefault: plan.isDefault
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: '',
            price: 0,
            description: '',
            description: '',
            isActive: true,
            isDefault: false
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Meal Plans</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white text-gray-900"
                            placeholder="e.g. Bed & Breakfast"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (per night)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                type="number"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                className="w-full p-2 pl-7 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white text-gray-900"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white text-gray-900"
                            placeholder="e.g. Includes daily breakfast"
                        />
                    </div>
                </div>

                <div className="mb-4 flex gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="form-checkbox h-5 w-5 text-brand-green rounded border-gray-300 focus:ring-brand-green"
                        />
                        <span className="text-gray-700 font-medium">Active</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                            className="form-checkbox h-5 w-5 text-brand-brown rounded border-gray-300 focus:ring-brand-brown"
                        />
                        <span className="text-gray-700 font-medium">Set as Default</span>
                    </label>
                </div>

                <div className="flex justify-end gap-3">
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-brand-green text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition"
                    >
                        {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
                        {editingId ? 'Update Plan' : 'Add Plan'}
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto">
                {/* Desktop Table */}
                <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mealPlans.map((plan) => (
                            <tr
                                key={plan._id}
                                onClick={() => handleEdit(plan)}
                                className="hover:bg-gray-50 transition cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                                    <Utensils size={18} className="text-brand-brown" />
                                    {plan.name}
                                    {plan.isDefault && (
                                        <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase bg-brand-brown/10 text-brand-brown rounded-full border border-brand-brown/20">
                                            Default
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-bold">
                                    ${plan.price} <span className="text-xs font-normal text-gray-500">/night</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {plan.isActive ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{plan.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(plan);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(plan._id);
                                        }}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {mealPlans.map((plan) => (
                        <div
                            key={plan._id}
                            onClick={() => handleEdit(plan)}
                            className="bg-white border boundary-gray-200 rounded-lg p-4 shadow-sm relative flex flex-col gap-3 active:scale-[0.98] transition-transform"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green">
                                        <Utensils size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                            {plan.name}
                                            {plan.isDefault && (
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-brand-brown/10 text-brand-brown rounded-full border border-brand-brown/20">
                                                    Default
                                                </span>
                                            )}
                                        </h4>
                                        <span className="text-sm font-medium text-brand-brown">${plan.price} / night</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(plan);
                                        }}
                                        className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(plan._id);
                                        }}
                                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">{plan.description}</span>
                                {plan.isActive ? (
                                    <span className="text-green-600 flex items-center gap-1 font-medium bg-green-50 px-2 py-1 rounded">
                                        <CheckCircle size={14} /> Active
                                    </span>
                                ) : (
                                    <span className="text-red-600 flex items-center gap-1 font-medium bg-red-50 px-2 py-1 rounded">
                                        <XCircle size={14} /> Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {loading && <p className="text-center py-4 text-gray-500">Loading...</p>}
                {!loading && mealPlans.length === 0 && (
                    <p className="text-center py-4 text-gray-500">No meal plans added yet.</p>
                )}
            </div>
        </div>
    );
};

export default AdminMealPlanManager;
