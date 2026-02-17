# CocoVilla - MERN Booking System

A lightweight, eco-friendly villa booking system built with the MERN stack.

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, Axios
- **Backend**: Node.js, Express, MongoDB
- **Services**: Mailgun (Email), Twilio (WhatsApp), Google OAuth

## Prerequisites
- Node.js (v16+)
- MongoDB (Atlas or Local)
- Mailgun & Twilio Accounts (Optional for notifications)
- Google Cloud Project (For OAuth, optional with Dev Login)

## Setup Instructions

### 1. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your MongoDB URI and other keys.
   ```bash
   cp .env.example .env
   ```
4. Seed the database (Creates Admin & Rooms):
   ```bash
   npm run seed
   ```
   *Note: This creates an admin user `madsampath94@gmail.com`*

5. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

### 3. Usage
- Open `http://localhost:5173` in your browser.
- **Login**: Click "Login" in the navigation. Use "Login as Admin" for the dashboard or "Login as User" to book.
- **Admin Dashboard**: View all bookings and approve/reject them.
- **User Dashboard**: View your booking status.

## Deployment
- **Frontend**: Vercel (Connect Git repo, set Output Directory to `dist`)
- **Backend**: Render/Railway (Connect Git repo, Root Directory `server`, Build Command `npm install`, Start Command `node index.js`)

## License
MIT
