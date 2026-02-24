import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getImages, uploadImage, deleteImage } from '../services/api';
import ConfirmModal from './ConfirmModal';
import { cloudinaryUrl } from '../utils/cloudinaryUrl';
import { Trash2, ImagePlus } from 'lucide-react';

const MAX_ROOM_IMAGES = 10;
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// ─── "Your Stay" Carousel Image Manager (embedded) ───────────────────────────
const CarouselImageManager = () => {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [confirm, setConfirm] = useState({ show: false });
    const fileRef = useRef();

    useEffect(() => { fetchImages(); }, []);

    const fetchImages = async () => {
        try {
            const res = await getImages('rooms');
            setImages(res.data.images || []);
        } catch {
            toast.error('Failed to load carousel images.');
        }
    };

    const handleFile = async (e) => {
        const file = e.target.files[0];
        e.target.value = null;
        if (!file) return;

        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error('Only JPG, PNG, WebP or GIF allowed.');
            return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast.error(`Image must be under ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }
        if (images.length >= MAX_ROOM_IMAGES) {
            toast.error(`Maximum ${MAX_ROOM_IMAGES} images allowed.`);
            return;
        }

        setUploading(true);
        try {
            await uploadImage('rooms', file);
            await fetchImages();
            toast.success('Image uploaded!');
        } catch (err) {
            const msg = err.response?.data?.message;
            toast.error(msg || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id) => {
        setConfirm({
            show: true,
            title: 'Delete Image?',
            message: 'This will permanently remove the image from Cloudinary.',
            onConfirm: async () => {
                setDeletingId(id);
                try {
                    await deleteImage(id);
                    await fetchImages();
                    toast.success('Image deleted.');
                } catch {
                    toast.error('Failed to delete image.');
                } finally {
                    setDeletingId(null);
                }
            }
        });
    };

    const canAdd = images.length < MAX_ROOM_IMAGES;

    return (
        <div className="mt-10 border-t border-gray-100 pt-8">
            <ConfirmModal {...confirm} onCancel={() => setConfirm({ show: false })} />

            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">"Your Stay" Carousel Images</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        These images appear in the photo slideshow on the home page · {images.length}/{MAX_ROOM_IMAGES} images
                    </p>
                </div>
                <button
                    onClick={() => canAdd && !uploading && fileRef.current?.click()}
                    disabled={!canAdd || uploading}
                    title={!canAdd ? `Maximum ${MAX_ROOM_IMAGES} images reached` : 'Upload new image'}
                    className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-dark transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {uploading
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <ImagePlus size={16} />}
                    {uploading ? 'Uploading…' : 'Add Image'}
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFile}
                />
            </div>

            {images.length === 0 && !uploading && (
                <div className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No carousel images yet. Click "Add Image" to upload the first one.
                </div>
            )}

            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {images.map((img, i) => (
                        <div key={img._id} className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <img
                                src={cloudinaryUrl(img.imageUrl, { width: 300 })}
                                alt={`Carousel ${i + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            {/* order badge */}
                            <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {i + 1}
                            </span>
                            {/* delete */}
                            <button
                                onClick={() => handleDelete(img._id)}
                                disabled={deletingId === img._id}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-red-600 transition opacity-0 group-hover:opacity-100 disabled:opacity-60"
                                title="Delete"
                            >
                                {deletingId === img._id
                                    ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <Trash2 size={12} />}
                            </button>
                        </div>
                    ))}

                    {/* Ghost "add" tile when under limit */}
                    {canAdd && (
                        <button
                            onClick={() => !uploading && fileRef.current?.click()}
                            disabled={uploading}
                            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-green hover:bg-green-50 transition flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-green disabled:opacity-40"
                        >
                            <ImagePlus size={22} />
                            <span className="text-xs font-medium">Add</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main Room Manager ────────────────────────────────────────────────────────
const AdminRoomManager = () => {
    const [roomType, setRoomType] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pricePerNight: '',
        maxGuests: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => { fetchRoomData(); }, []);

    const fetchRoomData = async () => {
        try {
            const res = await api.get('/rooms/type');
            if (res.data) setRoomType(res.data);
        } catch (err) {
            console.error('Failed to fetch room type', err);
            setError('Failed to load room data.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        if (roomType) {
            setFormData({
                title: roomType.title || '',
                description: roomType.description || '',
                pricePerNight: roomType.pricePerNight || '',
                maxGuests: roomType.maxGuests || ''
            });
            setIsEditing(true);
            setMessage(null);
            setTimeout(() => {
                document.getElementById('edit-room-form')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            const res = await api.put('/rooms/type', formData);
            setRoomType(res.data);
            setMessage('Room details updated successfully!');
            setIsEditing(false);
        } catch {
            setError('Failed to update. Please try again.');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading Room Details...</div>;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Manage Room Details</h2>

            {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            {/* Room Details Table */}
            <div className="overflow-x-auto mb-8">
                <table className="min-w-full text-left border rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Room Type</th>
                            <th className="px-6 py-3">Price / Night</th>
                            <th className="px-6 py-3">Max Guests</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 border-t">
                        {roomType ? (
                            <tr className="hover:bg-gray-50 transition group">
                                <td className="px-6 py-4 font-medium text-gray-900">{roomType.title}</td>
                                <td className="px-6 py-4 text-brand-green font-bold">${roomType.pricePerNight}</td>
                                <td className="px-6 py-4 text-gray-600">{roomType.maxGuests}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={handleEditClick}
                                        className="text-white bg-brand-green px-3 py-1 rounded text-sm hover:bg-brand-dark transition shadow-sm"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No room types found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Form */}
            {isEditing && (
                <div id="edit-room-form" className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-800">Edit Room: <span className="text-brand-green">{roomType?.title}</span></h3>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Night ($)</label>
                                <input type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none" required min="0" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                            <input type="number" name="maxGuests" value={formData.maxGuests} onChange={handleChange}
                                className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none" required min="1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none" required />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
                            <button type="submit" className="bg-brand-btn text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition shadow-md">Save Changes</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Carousel Images Section */}
            <CarouselImageManager />
        </div>
    );
};

export default AdminRoomManager;
