import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Check, X, Image as ImageIcon, GripVertical } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const MAX_SECTIONS = 6;
const MIN_SECTIONS = 2;
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const UploadSpinner = () => (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
        <div className="w-10 h-10 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-brand-green">Uploading...</p>
    </div>
);

// Single section card component
const SectionCard = ({ section, onSave, onDelete, isOnly, canAdd }) => {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(section.title);
    const [description, setDescription] = useState(section.description);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(section.imageUrl || null);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error('Only JPG, PNG, WebP or GIF allowed.');
            return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast.error(`Image must be under ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!title.trim() || !description.trim()) {
            toast.error('Title and description are required.');
            return;
        }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            if (imageFile) formData.append('image', imageFile);

            await onSave(section._id, formData);
            setEditing(false);
            setImageFile(null);
        } catch {
            // error handled by parent
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setTitle(section.title);
        setDescription(section.description);
        setImagePreview(section.imageUrl || null);
        setImageFile(null);
        setEditing(false);
    };

    return (
        <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden ${editing ? 'border-brand-green ring-2 ring-brand-green/20' : 'border-gray-100 hover:shadow-md'}`}>
            {/* Image area */}
            <div className="relative h-52 bg-gray-100 group">
                {imagePreview ? (
                    <img src={imagePreview} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <ImageIcon size={40} />
                        <p className="text-sm mt-2">No image</p>
                    </div>
                )}
                {editing && (
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition"
                    >
                        <ImageIcon size={28} />
                        <span className="text-sm mt-2 font-semibold">Change Image</span>
                    </button>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
                {saving && <div className="absolute inset-0"><UploadSpinner /></div>}
            </div>

            {/* Content */}
            <div className="p-5">
                {editing ? (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                                placeholder="Section title"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none resize-none"
                                placeholder="Section description..."
                            />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 bg-brand-green text-white py-2 rounded-lg text-sm font-bold hover:bg-brand-dark transition disabled:opacity-50"
                            >
                                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition"
                            >
                                <X size={16} /> Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 className="font-serif text-lg font-bold text-brand-dark mb-2 leading-snug">{section.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{section.description}</p>
                        <div className="flex items-center gap-2 mt-4">
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-1.5 text-sm font-bold text-brand-green hover:bg-brand-green/10 px-3 py-1.5 rounded-lg transition"
                            >
                                <Pencil size={14} /> Edit
                            </button>
                            <button
                                onClick={() => onDelete(section._id, section.title)}
                                disabled={isOnly}
                                title={isOnly ? `Minimum ${MIN_SECTIONS} sections required` : 'Delete section'}
                                className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// New section form component
const NewSectionForm = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) { toast.error('Only JPG, PNG, WebP or GIF allowed.'); return; }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { toast.error(`Image must be under ${MAX_FILE_SIZE_MB}MB.`); return; }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) { toast.error('Title and description are required.'); return; }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            if (imageFile) formData.append('image', imageFile);
            await onSave(formData);
        } catch {
            // handled by parent
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-brand-green/40 overflow-hidden">
            <div className="relative h-52 bg-gray-50 group cursor-pointer" onClick={() => fileRef.current?.click()}>
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 hover:text-brand-green transition">
                        <Plus size={36} />
                        <p className="text-sm mt-2 font-semibold">Click to add image</p>
                        <p className="text-xs mt-1 opacity-70">JPG, PNG, WebP — max {MAX_FILE_SIZE_MB}MB</p>
                    </div>
                )}
                {imagePreview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                        <span className="text-white text-sm font-bold">Change Image</span>
                    </div>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
                {saving && <div className="absolute inset-0"><UploadSpinner /></div>}
            </div>
            <div className="p-5 space-y-3">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                        placeholder="e.g. Tropical Swimming Pool"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none resize-none"
                        placeholder="Describe this facility section..."
                    />
                </div>
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-green text-white py-2 rounded-lg text-sm font-bold hover:bg-brand-dark transition disabled:opacity-50"
                    >
                        {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
                        {saving ? 'Saving...' : 'Add Section'}
                    </button>
                    <button onClick={onCancel} disabled={saving} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition">
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminFacilitySectionManager = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [confirm, setConfirm] = useState({ show: false });

    const fetchSections = async () => {
        try {
            const res = await api.get('/facility-sections');
            setSections(res.data);
        } catch (err) {
            toast.error('Failed to load facility sections.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSections(); }, []);

    const handleUpdate = async (id, formData) => {
        try {
            const res = await api.put(`/facility-sections/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSections(sections.map(s => s._id === id ? res.data : s));
            toast.success('Section updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update section.');
            throw err;
        }
    };

    const handleCreate = async (formData) => {
        try {
            const res = await api.post('/facility-sections', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSections([...sections, res.data]);
            setShowNewForm(false);
            toast.success('Section added!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add section.');
            throw err;
        }
    };

    const handleDeleteRequest = (id, sectionTitle) => {
        setConfirm({
            show: true,
            title: 'Delete Section?',
            message: `"${sectionTitle}" will be permanently removed. This cannot be undone.`,
            onConfirm: async () => {
                try {
                    await api.delete(`/facility-sections/${id}`);
                    setSections(sections.filter(s => s._id !== id));
                    toast.success('Section deleted.');
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to delete section.');
                }
            }
        });
    };

    const canAdd = sections.length < MAX_SECTIONS;
    const isAtMin = sections.length <= MIN_SECTIONS;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-8">
            <ConfirmModal {...confirm} onCancel={() => setConfirm({ show: false })} />

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Featured Facility Sections</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Shown on the public Facilities page as image + text sections.
                        <span className={`ml-2 font-semibold ${sections.length >= MAX_SECTIONS ? 'text-red-500' : 'text-brand-green'}`}>
                            {sections.length}/{MAX_SECTIONS} sections
                        </span>
                    </p>
                </div>
                <button
                    onClick={() => setShowNewForm(true)}
                    disabled={!canAdd || showNewForm}
                    title={!canAdd ? `Maximum ${MAX_SECTIONS} sections allowed` : 'Add a new section'}
                    className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-dark transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Plus size={16} /> Add Section
                </button>
            </div>

            {isAtMin && (
                <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
                    ⚠️ Minimum {MIN_SECTIONS} sections are required. You can't delete when at the minimum.
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                {sections.map((section) => (
                    <SectionCard
                        key={section._id}
                        section={section}
                        onSave={handleUpdate}
                        onDelete={handleDeleteRequest}
                        isOnly={isAtMin}
                    />
                ))}
                {showNewForm && (
                    <NewSectionForm
                        onSave={handleCreate}
                        onCancel={() => setShowNewForm(false)}
                    />
                )}
            </div>

            {sections.length === 0 && !showNewForm && (
                <div className="text-center py-12 text-gray-400">
                    <ImageIcon size={40} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No sections yet. Click <strong>Add Section</strong> to get started.</p>
                </div>
            )}
        </div>
    );
};

export default AdminFacilitySectionManager;
