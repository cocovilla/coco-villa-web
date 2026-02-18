import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, Edit2, Plus, Star, Wifi, Tv, BedDouble, ParkingCircle, Plane, Coffee, MapPin, Waves, Palmtree, Utensils, Car, ShieldCheck, Dumbbell, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

// Icon mapping for dynamic rendering
const iconMap = {
    Wifi, Tv, BedDouble, ParkingCircle, Plane, Coffee, MapPin, Waves, Palmtree, Utensils, Car, ShieldCheck, Dumbbell, Sparkles
};

const AdminFacilityManager = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: 'Wifi',
        isImportant: false
    });

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        try {
            const res = await api.get('/facilities');
            setFacilities(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch facilities", err);
            toast.error("Failed to load facilities");
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/facilities/${editingId}`, formData);
                toast.success("Facility updated successfully");
            } else {
                await api.post('/facilities', formData);
                toast.success("Facility added successfully");
            }
            fetchFacilities();
            resetForm();
        } catch (err) {
            console.error("Error saving facility", err);
            toast.error("Failed to save facility");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this facility?")) return;
        try {
            await api.delete(`/facilities/${id}`);
            toast.success("Facility deleted");
            setFacilities(facilities.filter(f => f._id !== id));
        } catch (err) {
            console.error("Error deleting facility", err);
            toast.error("Failed to delete facility");
        }
    };

    const handleEdit = (facility) => {
        setEditingId(facility._id);
        setFormData({
            title: facility.title,
            description: facility.description,
            icon: facility.icon,
            isImportant: facility.isImportant || false
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            icon: 'Wifi',
            isImportant: false
        });
    };

    const IconComponent = ({ name }) => {
        const Icon = iconMap[name] || Wifi;
        return <Icon size={20} />;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Facilities</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                        <select
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white text-gray-900"
                        >
                            {Object.keys(iconMap).map(iconName => (
                                <option key={iconName} value={iconName}>{iconName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white text-gray-900"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isImportant}
                            onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                            className="form-checkbox h-5 w-5 text-brand-green rounded border-gray-300 focus:ring-brand-green"
                        />
                        <span className="text-gray-700 font-medium">Mark as Important (Show on Home Page)</span>
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
                        {editingId ? 'Update Facility' : 'Add Facility'}
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto">
                {/* Desktop Table */}
                <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Important</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {facilities.map((facility) => (
                            <tr
                                key={facility._id}
                                onClick={() => handleEdit(facility)}
                                className="hover:bg-gray-50 transition cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-brand-green">
                                    <IconComponent name={facility.icon} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{facility.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {facility.isImportant && <Star size={18} className="text-yellow-500 fill-current inline-block" />}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{facility.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(facility);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(facility._id);
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
                    {facilities.map((facility) => (
                        <div
                            key={facility._id}
                            onClick={() => handleEdit(facility)}
                            className="bg-white border boundary-gray-200 rounded-lg p-4 shadow-sm relative flex flex-col gap-3 active:scale-[0.98] transition-transform"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green">
                                        <IconComponent name={facility.icon} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{facility.title}</h4>
                                        {facility.isImportant && (
                                            <span className="inline-flex items-center text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full mt-1">
                                                <Star size={10} className="fill-current mr-1" /> Important
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(facility);
                                        }}
                                        className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(facility._id);
                                        }}
                                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {facility.description}
                            </p>
                        </div>
                    ))}
                </div>
                {loading && <p className="text-center py-4 text-gray-500">Loading...</p>}
                {!loading && facilities.length === 0 && (
                    <p className="text-center py-4 text-gray-500">No facilities added yet.</p>
                )}
            </div>
        </div>
    );
};

export default AdminFacilityManager;
