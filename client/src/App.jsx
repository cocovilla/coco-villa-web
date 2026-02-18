import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Facilities from './pages/Facilities';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        },
        success: {
          style: {
            background: '#E8F5E9',
            color: '#2E7D32',
            border: '1px solid #C8E6C9'
          },
        },
        error: {
          style: {
            background: '#FFEBEE',
            color: '#C62828',
            border: '1px solid #FFCDD2'
          },
        },
      }} />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/facilities" element={<Layout><Facilities /></Layout>} />
        <Route path="/my-bookings" element={<Layout><MyBookings /></Layout>} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
