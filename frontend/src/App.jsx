
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';


import Register from './authenticated/register';
import Login from './authenticated/login';
import Logout from './authenticated/logout';

import Home from './pages/home';
import Navbar from './component/navbar';
import Grounds from './pages/ground';
import BookingForm from './pages/bookings/BookingForm';
import OwnerRegister from './authenticated/register_owner';
import LocationPicker from './component/locationPicker';
import UserUpdate from './pages/user/userUpdate';
// import EditGrounds from './pages/owner/groundUpdate';
import OwnerDashboard from './pages/owner/dashboard';
import AdminPanel from './pages/admin/adminPanal';
import UserGroundBookings from './pages/user/allBookings';
import EditGrounds from './pages/owner/ground edit/EditGrounds';
import PaymentModal from './pages/bookings/payment';
import AdminDashboard from './pages/admin/adminDashboard';

function AppContent() {
  const location = useLocation();

  // Hide navbar on register, login, and register-owner pages
  const hideNavbar = location.pathname === '/register' || location.pathname === '/login' || location.pathname === '/register-owner';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="p-4">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/logout' element={<Logout />} />
          <Route path='/grounds' element={<Grounds />} />
          <Route path='/book/:ownerId' element={<BookingForm />} />
          <Route path='/register-owner' element={<OwnerRegister />} />
          <Route path="/location-picker" element={<LocationPicker />} />
          <Route path="/userEdit/" element={<UserUpdate />} />
          <Route path="/ownerEdit/" element={<EditGrounds />} />
          <Route path="/dashboard/" element={<OwnerDashboard />} />
          <Route path="/admin-panel/" element={<AdminPanel />} />
          <Route path="/all-bookings/" element={<UserGroundBookings />} />
          {/* <Route path="/payment/:bookingId/" element={<PaymentPage />} /> */}
          <Route path="/admin-Dashboard/" element={<AdminDashboard/>} />







        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

