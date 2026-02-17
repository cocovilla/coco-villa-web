import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getBlockedDates, blockDate, updateBlockedDate, deleteBlockedDate } from '../services/api';

const AdminAvailabilityManager = () => {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [reason, setReason] = useState('Maintenance');
    const [loading, setLoading] = useState(false);
    const [blockedDates, setBlockedDates] = useState([]);
    const [editingBlock, setEditingBlock] = useState(null);

    useEffect(() => {
        fetchBlockedDates();
    }, []);

    const fetchBlockedDates = async () => {
        try {
            const res = await getBlockedDates();
            setBlockedDates(res.data);
        } catch (err) {
            console.error("Failed to fetch blocked dates", err);
            toast.error("Failed to fetch blocked dates");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!checkIn || !checkOut) {
            toast.error("Please select both check-in and check-out dates");
            setLoading(false);
            return;
        }

        try {
            const data = { checkIn, checkOut, reason };

            if (editingBlock) {
                await updateBlockedDate(editingBlock._id, data);
                toast.success("Block updated successfully!");
            } else {
                await blockDate(data);
                toast.success("Dates blocked successfully!");
            }

            // Reset form and refresh list
            setCheckIn('');
            setCheckOut('');
            setReason('Maintenance');
            setEditingBlock(null);
            fetchBlockedDates();
        } catch (err) {
            console.error("Operation failed", err);
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (block) => {
        setEditingBlock(block);
        setCheckIn(new Date(block.checkIn).toISOString().split('T')[0]);
        setCheckOut(new Date(block.checkOut).toISOString().split('T')[0]);
        // Extract reason from "Manual Block: Reason" or use cleaned string
        const cleanReason = block.message?.replace('Manual Block: ', '') || 'Maintenance';
        setReason(cleanReason);
        window.scrollTo({ top: document.getElementById('availability-form')?.offsetTop - 100, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to unblock these dates?")) return;
        try {
            await deleteBlockedDate(id);
            toast.success("Block removed successfully");
            fetchBlockedDates();
        } catch (err) {
            console.error("Delete failed", err);
            toast.error(err.response?.data?.message || "Failed to delete block");
        }
    };

    const handleCancelEdit = () => {
        setEditingBlock(null);
        setCheckIn('');
        setCheckOut('');
        setReason('Maintenance');
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Manual Availability Management</h2>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm">
                <span className="font-bold">Note:</span> Blocking dates creates a "Confirmed" booking in the system, preventing users from booking these dates.
            </div>

            {/* Blocked Dates Table */}
            <div className="mb-8 overflow-x-auto">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Currently Blocked Dates</h3>
                {blockedDates.length > 0 ? (
                    <table className="min-w-full text-left bg-gray-50 rounded-lg overflow-hidden">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-4 py-3">Start Date</th>
                                <th className="px-4 py-3">End Date</th>
                                <th className="px-4 py-3">Reason</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {blockedDates.map((block) => (
                                <tr
                                    key={block._id}
                                    className={`hover:bg-blue-50 transition cursor-pointer ${editingBlock?._id === block._id ? 'bg-blue-100 ring-2 ring-blue-300' : ''}`}
                                    onClick={() => handleEdit(block)}
                                    title="Click to edit"
                                >
                                    <td className="px-4 py-3 font-medium">{new Date(block.checkIn).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 font-medium">{new Date(block.checkOut).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-gray-600">{block.message?.replace('Manual Block: ', '')}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(block._id); }}
                                            className="text-red-500 hover:text-red-700 text-sm font-bold px-2 py-1 rounded hover:bg-red-50"
                                        >
                                            Unblock
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500 italic text-sm">No dates are currently manually blocked.</p>
                )}
            </div>

            <form id="availability-form" onSubmit={handleFormSubmit} className="space-y-4 border-t pt-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-700">
                        {editingBlock ? 'Edit Blocked Dates' : 'Block New Dates'}
                    </h3>
                    {editingBlock && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-sm text-gray-500 hover:text-gray-800 underline"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Note</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Maintenance, Private Event"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`${editingBlock ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-500 hover:bg-red-600'} text-white font-bold py-2 px-6 rounded-lg transition shadow-md disabled:opacity-50`}
                    >
                        {loading ? 'Processing...' : (editingBlock ? 'Update Block' : 'Block Dates')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAvailabilityManager;
