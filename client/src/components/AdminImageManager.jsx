import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getImages, uploadImage, deleteImage } from '../services/api';
import ConfirmModal from './ConfirmModal';
import { cloudinaryUrl } from '../utils/cloudinaryUrl';

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const UploadSpinner = () => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
        <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-brand-green font-semibold text-sm">Uploading to cloud...</p>
        <p className="text-gray-400 text-xs mt-1">Please wait, do not close this page</p>
    </div>
);

const AdminImageManager = () => {
    const [section, setSection] = useState('hero');
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [refresh, setRefresh] = useState(0);
    const [confirm, setConfirm] = useState({ show: false });

    useEffect(() => {
        fetchImages();
    }, [section, refresh]);

    const fetchImages = async () => {
        try {
            const res = await getImages(section);
            setImages(res.data.images || []);
        } catch (err) {
            console.error("Failed to load images", err);
            toast.error("Failed to load images. Check your connection.");
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

        setUploading(true);
        try {
            await uploadImage(section, file);
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

    const sectionLimits = { hero: 1, garden: 10, rooms: 10 };

    return (
        <div className="relative bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-8">
            {/* Upload Spinner Overlay */}
            {uploading && <UploadSpinner />}
            <ConfirmModal {...confirm} onCancel={() => setConfirm({ show: false })} />

            <h2 className="text-xl font-bold text-gray-800 mb-6">Site Content Management</h2>

            {/* Section Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
                {['hero', 'garden', 'rooms'].map((sec) => (
                    <button
                        key={sec}
                        onClick={() => !uploading && setSection(sec)}
                        disabled={uploading}
                        className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition ${section === sec
                            ? 'text-brand-green border-b-2 border-brand-green'
                            : 'text-gray-400 hover:text-gray-600'
                            } disabled:opacity-50`}
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
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-brand-green file:text-white
                            hover:file:bg-opacity-90 transition
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {section === 'hero' && "Only 1 image allowed (will replace existing). "}
                    {section === 'rooms' && "Max 10 images allowed. "}
                    {section === 'garden' && "Max 10 images allowed. "}
                    JPG, PNG, WebP — max {MAX_FILE_SIZE_MB}MB
                </p>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, index) => (
                    <div key={img._id || index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                            src={cloudinaryUrl(img.imageUrl, { width: 200 })}
                            alt={`${section} ${index}`}
                            className="w-full h-full object-cover"
                        />
                        {/* Delete Button */}
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
                    No images uploaded for <span className="font-semibold">{section}</span> yet.
                </div>
            )}

            {/* Image count */}
            {images.length > 0 && (
                <p className="text-xs text-gray-400 mt-4 text-right">
                    {images.length} / {sectionLimits[section]} image{images.length !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
};

export default AdminImageManager;
