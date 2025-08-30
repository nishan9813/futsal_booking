
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';


import Register from './authenticated/register';
import Login from './authenticated/login';
import Logout from './authenticated/logout';

import Home from './pages/home/home';
import Navbar from './component/navbar/navbar';
import Grounds from './pages/grounds/ground';
import BookingForm from './pages/booking/booking';
import OwnerRegister from './authenticated/register_owner';
import LocationPicker from './component/location/LocationPicker';
import UserUpdate from './updatePages/userUpdate';
import EditGrounds from './updatePages/groundUpdate';
import OwnerDashboard from './pages/owner/dashboard';
import AdminPanel from './admin-pages/adminPanal';
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
          {/* <Route path="/user/:id" element={<user />} /> */}
          <Route path="/userEdit/:id" element={<UserUpdate />} />
          <Route path="/ownerEdit/:id" element={<EditGrounds />} />
          <Route path="/dashboard/" element={<OwnerDashboard />} />
          <Route path="/admin-panal/" element={<AdminPanel />} />




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

