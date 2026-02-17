import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Image API
export const getImages = (section) => api.get(`/images/${section}`);
export const uploadImage = (section, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/images/upload/${section}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
export const deleteImage = (id) => api.delete(`/images/${id}`);


// Blocked Dates API
export const getBlockedDates = () => api.get('/bookings/admin/blocks');
export const blockDate = (data) => api.post('/bookings/admin/block', data);
export const updateBlockedDate = (id, data) => api.put(`/bookings/admin/block/${id}`, data);
export const deleteBlockedDate = (id) => api.delete(`/bookings/admin/block/${id}`);

export default api;
