import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getImages, uploadImage, deleteImage } from '../services/api';

const AdminImageManager = () => {
    const [section, setSection] = useState('hero');
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        fetchImages();
    }, [section, refresh]);

    const fetchImages = async () => {
        try {
            const res = await getImages(section);
            setImages(res.data.images || []);
        } catch (err) {
            console.error("Failed to load images", err);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadImage(section, file);
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

    // Default Images (Removed as per user request to show only uploaded images)
    // const defaults = { ... };

    const displayImages = images; // Only show uploaded images

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Site Content Management</h2>

            {/* Section Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
                {['hero', 'garden', 'rooms'].map((sec) => (
                    <button
                        key={sec}
                        onClick={() => setSection(sec)}
                        className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition ${section === sec
                            ? 'text-brand-green border-b-2 border-brand-green'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {sec}
                    </button>
                ))}
            </div>

            {/* Upload Area */}
            <div className="mb-8">
                <label className="block mb-2 text-sm font-medium text-gray-700">Add New Image</label>
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-brand-green file:text-white
                            hover:file:bg-opacity-90 transition"
                    />
                    {uploading && <span className="text-brand-brown animate-pulse">Uploading...</span>}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {section === 'hero' && "Only 1 image allowed (will replace existing)."}
                    {section === 'rooms' && "Max 10 images allowed."}
                </p>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayImages.map((img, index) => {
                    return (
                        <div key={img._id || index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <img
                                src={`http://localhost:5000${img.imageUrl}`}
                                alt={`${section} ${index}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDelete(img._id)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-600 transition"
                                title="Delete Image"
                            >
                                ✕
                            </button>
                        </div>
                    );
                })}
            </div>
            {images.length === 0 && (
                <div className="text-center py-4 text-gray-400 italic">
                    (No custom images uploaded)
                </div>
            )}
        </div>
    );
};

export default AdminImageManager;
