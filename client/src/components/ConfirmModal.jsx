import React from 'react';

/**
 * Reusable styled confirmation modal.
 *
 * Usage:
 *   const [confirm, setConfirm] = useState({ show: false, message: '', onConfirm: null });
 *
 *   // Trigger:
 *   setConfirm({ show: true, title: 'Delete image?', message: 'This cannot be undone.', onConfirm: () => doDelete(id) });
 *
 *   // In JSX:
 *   <ConfirmModal {...confirm} onCancel={() => setConfirm({ show: false })} />
 */
const ConfirmModal = ({ show, title = 'Are you sure?', message, confirmLabel = 'Confirm', confirmClass = 'bg-red-500 hover:bg-red-600', onConfirm, onCancel }) => {
    if (!show) return null;

    const handleConfirm = () => {
        onCancel(); // close first
        if (onConfirm) onConfirm();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in-up">
                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-4">
                    <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 text-center mb-2">{title}</h3>

                {/* Message */}
                {message && <p className="text-sm text-gray-500 text-center mb-6">{message}</p>}

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition ${confirmClass}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
