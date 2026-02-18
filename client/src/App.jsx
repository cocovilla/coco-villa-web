import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Facilities from './pages/Facilities';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import ProfileSetup from './pages/ProfileSetup';

function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '16px',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxWidth: '500px',
          },
          // Default options for specific types
          success: {
            duration: 4000,
            style: {
              background: '#F0FDF4', // green-50
              color: '#15803D',      // green-700
              border: '1px solid #BBF7D0',
              fontWeight: '500',
            },
            iconTheme: {
              primary: '#15803D',
              secondary: '#F0FDF4',
            },
          },
          error: {
            duration: 6000,
            style: {
              background: '#FEF2F2', // red-50
              color: '#B91C1C',      // red-700
              border: '1px solid #FECACA',
              fontWeight: '500',
            },
            iconTheme: {
              primary: '#B91C1C',
              secondary: '#FEF2F2',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/facilities" element={<Layout><Facilities /></Layout>} />
        <Route path="/my-bookings" element={<Layout><MyBookings /></Layout>} />
        <Route path="/profile-setup" element={<Layout><ProfileSetup /></Layout>} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
