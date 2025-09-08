import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosClient from '../authenticated/axiosCredint';

function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const MEDIA_URL = 'http://127.0.0.1:8000/media/';

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const res = await axiosClient.get('/api/current_user/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user || null);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [location]);

  if (loading) return <nav className="bg-white p-4 shadow-md">Loading...</nav>;

  const profileImage = user?.profile_pic
    ? (user.profile_pic.startsWith('http') ? user.profile_pic : `${MEDIA_URL}${user.profile_pic}`)
    : null;

  const displayName = user?.role === 'owner' ? user.futsal_name : user?.username;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
      <nav className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-indigo-600">sports_soccer</span>
          <Link to="/" className="text-3xl font-bold text-gray-800">FutsalGo</Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link className={`nav-link text-gray-600 hover:text-indigo-600 ${location.pathname === '/' ? 'active' : ''}`} to="/">Home</Link>
          <Link className={`nav-link text-gray-600 hover:text-indigo-600 ${location.pathname === '/my-bookings' ? 'active' : ''}`} to="/my-bookings">My Bookings</Link>
          <Link className={`nav-link text-gray-600 hover:text-indigo-600 ${location.pathname === '/find-grounds' ? 'active' : ''}`} to="/find-grounds">Find Grounds</Link>
          {user?.role === 'owner' && (
            <Link className={`nav-link text-gray-600 hover:text-indigo-600 ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard">Dashboard</Link>
          )}
        </div>

        {/* User / Auth Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="relative hidden md:flex items-center gap-4 group">
                <span className="text-sm font-medium text-gray-600">Welcome, {displayName}</span>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-600 transition-all duration-300"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-indigo-200 flex items-center justify-center text-white font-bold">U</div>
                )}
                {/* Dropdown */}
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible">
                  <Link className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" to={`/userEdit/${user.id}`}>Profile</Link>
                  <Link className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" to="/settings">Settings</Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <Link className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100" to="/logout">Logout</Link>
                </div>
              </div>

              {/* Role-Based Actions */}
              <div className="hidden md:flex items-center gap-3">
                {user.role === 'owner' && (
                  <Link to={`/ownerEdit/${user.id}`} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">Edit Ground</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin-panel" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">Admin Panel</Link>
                )}
                {user.role === 'user' && (
                  <Link to="/register-owner" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">Register a Ground</Link>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors" to="/login">Log In</Link>
              <Link className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors" to="/register">Sign Up</Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 focus:outline-none">
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
