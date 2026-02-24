import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { getImages, uploadImage, deleteImage } from '../services/api';
import ConfirmModal from './ConfirmModal';

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const UploadSpinner = () => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
        <div className="w-12 h-12 border-4 border-brand-brown border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-brand-brown font-semibold text-sm">Uploading to cloud...</p>
        <p className="text-gray-400 text-xs mt-1">Please wait, do not close this page</p>
    </div>
);

const AdminExperienceManager = () => {
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [savingText, setSavingText] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [refresh, setRefresh] = useState(0);
    const [confirm, setConfirm] = useState({ show: false });

    useEffect(() => {
        fetchContent();
    }, [refresh]);

    const fetchContent = async () => {
        try {
            const res = await getImages('experience');
            setImages(res.data?.images || []);
            if (res.data.textContent) {
                setDescription(res.data.textContent.content || '');
            }
        } catch (err) {
            console.error("Failed to load experience content", err);
            toast.error("Failed to load content. Check your connection.");
        }
    };

    const handleSaveDescription = async () => {
        if (!description.trim()) {
            toast.error("Description cannot be empty.");
            return;
        }
        setSavingText(true);
        try {
            await api.put('/images/text/experience', { content: description });
            toast.success("Description updated successfully!");
        } catch (err) {
            console.error("Failed to update description", err);
            toast.error("Failed to save description. Please try again.");
        } finally {
            setSavingText(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error("Invalid file type. Please upload a JPG, PNG, WebP, or GIF.");
            e.target.value = null;
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
            e.target.value = null;
            return;
        }

        // Enforce max 2 images on frontend too
        if (images.length >= 2) {
            toast.error("Maximum 2 images allowed for the experience section.");
            e.target.value = null;
            return;
        }

        setUploading(true);
        try {
            await uploadImage('experience', file);
            setRefresh(prev => prev + 1);
            toast.success("Image uploaded successfully!");
        } catch (err) {
            console.error("Upload failed", err);
            const msg = err.response?.data?.message;
            if (msg) {
                toast.error(msg);
            } else if (err.code === 'ERR_NETWORK') {
                toast.error("Network error. Check your connection and try again.");
            } else {
                toast.error("Upload failed. Please try again.");
            }
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const handleDelete = (id) => {
        setConfirm({
            show: true,
            title: 'Delete Image?',
            message: 'This will permanently remove the image from Cloudinary and cannot be undone.',
            onConfirm: async () => {
                setDeleting(id);
                try {
                    await deleteImage(id);
                    setRefresh(prev => prev + 1);
                    toast.success('Image deleted.');
                } catch (err) {
                    console.error('Delete failed', err);
                    toast.error('Failed to delete image. Please try again.');
                } finally {
                    setDeleting(null);
                }
            }
        });
    };

    return (
        <div className="relative bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-8">
            {/* Upload Spinner Overlay */}
            {uploading && <UploadSpinner />}
            <ConfirmModal {...confirm} onCancel={() => setConfirm({ show: false })} />

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
                />
                <button
                    onClick={handleSaveDescription}
                    disabled={savingText}
                    className="bg-brand-green text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-dark transition disabled:opacity-50 flex items-center gap-2"
                >
                    {savingText && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {savingText ? 'Saving...' : 'Save Description'}
                </button>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Experience Images <span className="text-gray-400">({images.length}/2)</span>
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        disabled={uploading || images.length >= 2}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-brand-brown file:text-white
                            hover:file:bg-opacity-90 transition
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {images.length >= 2
                        ? "Maximum 2 images reached. Delete one to upload another."
                        : `JPG, PNG, WebP — max ${MAX_FILE_SIZE_MB}MB`}
                </p>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, index) => (
                    <div key={img._id || index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                            src={img.imageUrl}
                            alt={`Experience ${index}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={() => handleDelete(img._id)}
                            disabled={deleting === img._id}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-600 transition disabled:opacity-60"
                            title="Delete Image"
                        >
                            {deleting === img._id
                                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : '✕'}
                        </button>
                    </div>
                ))}
            </div>

            {images.length === 0 && !uploading && (
                <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-lg">
                    No images uploaded yet.
                </div>
            )}
        </div>
    );
};

export default AdminExperienceManager;
