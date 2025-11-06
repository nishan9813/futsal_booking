// import React, { useEffect, useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import axiosClient from '../authenticated/axiosCredint';

// function Navbar() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const location = useLocation();
//   const MEDIA_URL = 'http://127.0.0.1:8000/media/';

//   useEffect(() => {
//     async function fetchUser() {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem('access_token');
//         if (!token) {
//           setUser(null);
//           setLoading(false);
//           return;
//         }

//         const res = await axiosClient.get('/api/current_user/', {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setUser(res.data.user || null);
//       } catch (error) {
//         console.error('Failed to fetch current user:', error);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUser();
//   }, [location]);

//   if (loading) return <nav className="bg-white p-4 shadow-md">Loading...</nav>;

//   const profileImage = user?.profile_pic
//     ? (user.profile_pic.startsWith('http') ? user.profile_pic : `${MEDIA_URL}${user.profile_pic}`)
//     : null;

//   const displayName = user?.role === 'owner' ? user.futsal_name : user?.username;

//   return (
//     <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
//       <nav className="container mx-auto px-6 py-3 flex items-center justify-between">
//         {/* Logo */}
//         <div className="flex items-center gap-3">
//           <span className="material-symbols-outlined text-4xl text-indigo-600">sports_soccer</span>
//           <Link to="/" className="text-3xl font-bold text-gray-800">FutsalGo</Link>
//         </div>

//         {/* Desktop Links */}
//         <div className="hidden md:flex items-center gap-10">
//           <Link className={`nav-link text-gray-600 hover:text-indigo-600 ${location.pathname === '/' ? 'active' : ''}`} to="/">Home</Link>
//           <Link className={`nav-link text-gray-600 hover:text-indigo-600 ${location.pathname === '/my-bookings' ? 'active' : ''}`} to="/my-bookings">My Bookings</Link>
//           <Link className={`nav-link text-gray-600 hover:text-indigo-600 ${location.pathname === '/find-grounds' ? 'active' : ''}`} to="/find-grounds">Find Grounds</Link>
//           {user?.role === 'owner' && (
//             <Link className={`nav-link text-gray-600 hover:text-indigo-600 ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard">Dashboard</Link>
//           )}
//         </div>

//         {/* User / Auth Buttons */}
//         <div className="flex items-center gap-4">
//           {user ? (
//             <>
//               <div className="relative hidden md:flex items-center gap-4 group">
//                 <span className="text-sm font-medium text-gray-600">Welcome, {displayName}</span>
//                 {profileImage ? (
//                   <img
//                     src={profileImage}
//                     alt="Profile"
//                     className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-600 transition-all duration-300"
//                   />
//                 ) : (
//                   <div className="w-11 h-11 rounded-full bg-indigo-200 flex items-center justify-center text-white font-bold">U</div>
//                 )}
//                 {/* Dropdown */}
//                 <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible">
//                   <Link className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" to={`/userEdit/`}>Profile</Link>
//                   <Link className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" to="/settings">Settings</Link>
//                   <div className="border-t border-gray-200 my-1"></div>
//                   <Link className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100" to="/logout">Logout</Link>
//                 </div>
//               </div>

//               {/* Role-Based Actions */}
//               <div className="hidden md:flex items-center gap-3">
//                 {user.role === 'owner' && (
//                   <Link to={`/ownerEdit/`} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">Edit Ground</Link>
//                 )}
//                 {user.role === 'admin' && (
//                   <Link to="/admin-panel" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">Admin Panel</Link>
//                 )}
//                 {user.role === 'user' && (
//                   <Link to="/register-owner" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">Register a Ground</Link>
//                 )}
//               </div>
//             </>
//           ) : (
//             <div className="hidden md:flex items-center gap-3">
//               <Link className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors" to="/login">Log In</Link>
//               <Link className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors" to="/register">Sign Up</Link>
//             </div>
//           )}

//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <button className="text-gray-700 focus:outline-none">
//               <span className="material-symbols-outlined text-3xl">menu</span>
//             </button>
//           </div>
//         </div>
//       </nav>
//     </header>
//   );
// }

// export default Navbar;


import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosClient from '../authenticated/axiosCredint';

function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  if (loading) return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </nav>
    </header>
  );

  const profileImage = user?.profile_pic
    ? (user.profile_pic.startsWith('http') ? user.profile_pic : `${MEDIA_URL}${user.profile_pic}`)
    : null;

  const displayName = user?.role === 'owner' ? user.futsal_name : user?.username;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/my-bookings', label: 'My Bookings' },
    { path: '/find-grounds', label: 'Find Grounds' },
    ...(user?.role === 'owner' ? [{ path: '/dashboard', label: 'Dashboard' }] : [])
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 supports-backdrop-blur:bg-white/60">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              FutsalGo
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-semibold text-lg transition-all duration-300 group ${
                  location.pathname === link.path 
                    ? 'text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                )}
                <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full group-hover:w-full transition-all duration-300"></div>
              </Link>
            ))}
          </div>

          {/* User / Auth Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Role-Based Actions */}
                <div className="hidden md:flex items-center gap-3">
                  {user.role === 'owner' && (
                    <Link 
                      to={`/ownerEdit/`} 
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Edit Ground
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin-panel" 
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Admin Panel
                    </Link>
                  )}
                  {user.role === 'user' && (
                    <Link 
                      to="/register-owner" 
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Register Ground
                    </Link>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 group p-2 rounded-2xl hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className="text-right hidden sm:block">
                      <div className="font-semibold text-gray-900 text-sm">{displayName}</div>
                      <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                    </div>
                    <div className="relative">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 shadow-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="font-semibold text-gray-900">{displayName}</div>
                        <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                      </div>
                      
                      <div className="py-2">
                        <Link 
                          to={`/userEdit/`} 
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                        >
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </Link>
                        <Link 
                          to="/settings" 
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                        >
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-2">
                        <Link 
                          to="/logout" 
                          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors group"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 animate-fade-in">
            <div className="space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {!user && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <Link to="/login" className="block py-3 px-4 text-center rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                    Log In
                  </Link>
                  <Link to="/register" className="block py-3 px-4 text-center rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop for dropdowns */}
      {(isProfileOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
          onClick={() => {
            setIsProfileOpen(false);
            setIsMobileMenuOpen(false);
          }}
        ></div>
      )}
    </header>
  );
}

export default Navbar;