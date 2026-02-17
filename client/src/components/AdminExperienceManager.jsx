import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { getImages, uploadImage, deleteImage } from '../services/api';

const AdminExperienceManager = () => {
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [savingText, setSavingText] = useState(false);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        fetchContent();
    }, [refresh]);

    const fetchContent = async () => {
        try {
            const res = await getImages('experience'); // This now returns { images, textContent }
            console.log("Experience API Response:", res.data);
            setImages(res.data?.images || []);
            if (res.data.textContent) {
                setDescription(res.data.textContent.content || '');
            }
        } catch (err) {
            console.error("Failed to load experience content", err);
        }
    };

    const handleSaveDescription = async () => {
        setSavingText(true);
        try {
            await api.put('/images/text/experience', { content: description });
            toast.success("Description updated successfully!");
        } catch (err) {
            console.error("Failed to update description", err);
            toast.error("Failed to update description");
        } finally {
            setSavingText(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadImage('experience', file);
            setRefresh(prev => prev + 1);
            toast.success("Image uploaded successfully!");
        } catch (err) {
            console.error("Upload failed", err);
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
            e.target.value = null; // Reset input
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;
        try {
            await deleteImage(id);
            setRefresh(prev => prev + 1);
        } catch (err) {
            console.error("Delete failed", err);
            toast.error("Failed to delete image");
        }
    };

    // Default Images fallback (if needed for display logic, but mostly we show uploaded)
    const displayImages = images;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Experience Section Management</h2>

            {/* Description Editor */}
            <div className="mb-8">
                <label className="block mb-2 text-sm font-medium text-gray-700">Description Text</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none mb-3"
                    placeholder="Enter the exciting description for the experience section..."
                ></textarea>
                <button
                    onClick={handleSaveDescription}
                    disabled={savingText}
                    className="bg-brand-green text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-dark transition disabled:opacity-50"
                >
                    {savingText ? 'Saving...' : 'Save Description'}
                </button>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">Experience Images (Max 2)</label>
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading || images.length >= 2}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-brand-brown file:text-white
                            hover:file:bg-opacity-90 transition disabled:opacity-50"
                    />
                    {uploading && <span className="text-brand-brown animate-pulse">Uploading...</span>}
                </div>
                {images.length >= 2 && <p className="text-xs text-red-500 mt-2">Maximum 2 images reached.</p>}
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayImages.map((img, index) => (
                    <div key={img._id || index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                            src={`http://localhost:5000${img.imageUrl}`}
                            alt={`Experience ${index}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={() => handleDelete(img._id)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-600 transition"
                            title="Delete Image"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
            {images.length === 0 && (
                <div className="text-center py-4 text-gray-400 italic bg-gray-50 rounded-lg">
                    (No images uploaded)
                </div>
            )}
        </div>
    );
};

export default AdminExperienceManager;
