
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Register from './authenticated/register';
import Login from './authenticated/login';
import Logout from './authenticated/logout';

import Home from './pages/home';
import Navbar from './navbar/navbar';
import Grounds from './pages/grounds/ground';
import BookingForm from './pages/booking/booking';

function App() {
  return (
    <Router>
      <Navbar /> {/* This stays visible on all pages */}
      <div className="p-4">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/logout' element={<Logout />} />
          <Route path='/grounds' element={<Grounds />} />
          <Route path='/book/:id' element={<BookingForm />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;
