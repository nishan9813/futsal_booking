import React, { useState, useEffect } from 'react';
import axiosClient from '../../authenticated/axiosCredint';

const UserUpdate = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '+977',
    profile_pic: null,
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    axiosClient.get('/api/userUpdate/')
      .then(res => {
        setFormData(prev => ({
          ...prev,
          ...res.data,
          profile_pic: res.data.profile_pic || null,
          old_password: '',
          new_password: '',
          new_password_confirm: '',
          phone: res.data.phone ? res.data.phone : '+977',
        }));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load user data.');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_pic') {
      setFormData(prev => ({
        ...prev,
        profile_pic: files[0] || null
      }));
    } else if (name === 'phone') {
      let newVal = value.startsWith('+977') ? value : '+977' + value.replace(/\+977/, '');
      setFormData(prev => ({
        ...prev,
        phone: newVal
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('first_name', formData.first_name || '');
    data.append('last_name', formData.last_name || '');
    data.append('phone', formData.phone || '');
    if (formData.profile_pic instanceof File) {
      data.append('profile_pic', formData.profile_pic);
    }
    if (formData.old_password || formData.new_password || formData.new_password_confirm) {
      data.append('old_password', formData.old_password);
      data.append('new_password', formData.new_password);
      data.append('new_password_confirm', formData.new_password_confirm);
    }

    axiosClient.patch('/api/userUpdate/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(() => {
        setShowSuccessOverlay(true);
        setTimeout(() => window.location.reload(), 2000);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          setError(JSON.stringify(err.response.data, null, 2));
        } else {
          setError('Update failed. Please try again.');
        }
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Update Your
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Profile
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your personal information and security settings
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-4">
            {/* Sidebar Navigation */}
            <div className="bg-gradient-to-b from-blue-600 to-purple-600 p-8 lg:p-10">
              <div className="text-center lg:text-left">
                {/* Profile Picture */}
                <div className="relative w-32 h-32 mx-auto lg:mx-0 mb-6 cursor-pointer group">
                  <img
                    src={
                      formData.profile_pic
                        ? formData.profile_pic instanceof File
                          ? URL.createObjectURL(formData.profile_pic)
                          : formData.profile_pic
                        : '/placeholder-profile.png'
                    }
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white/20 shadow-2xl"
                  />
                  <div 
                    className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                    onClick={() => document.getElementById('profilePicInput').click()}
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 text-white mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white text-sm font-medium">Change Photo</span>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-white mb-2">{formData.first_name || formData.username}</h2>
                <p className="text-blue-100 mb-8">{formData.email}</p>

                {/* Navigation Tabs */}
                <div className="space-y-3">
                  {[
                    { id: 'profile', label: 'Profile Info', icon: '👤' },
                    { id: 'security', label: 'Security', icon: '🔒' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white shadow-lg'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">{tab.icon}</span>
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 p-8 lg:p-12">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <pre className="text-sm whitespace-pre-wrap">{error}</pre>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <input
                  id="profilePicInput"
                  type="file"
                  name="profile_pic"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />

                {activeTab === 'profile' && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-yellow-800 mb-1">Change Password</h3>
                          <p className="text-yellow-700 text-sm">Leave these fields empty if you don't want to change your password.</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Current Password</label>
                      <input
                        type="password"
                        name="old_password"
                        value={formData.old_password}
                        onChange={handleChange}
                        placeholder="Enter your current password"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">New Password</label>
                        <input
                          type="password"
                          name="new_password"
                          value={formData.new_password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Confirm New Password</label>
                        <input
                          type="password"
                          name="new_password_confirm"
                          value={formData.new_password_confirm}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-12">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Profile
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-4 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-4">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Success!</h2>
            <p className="text-gray-600 text-lg mb-6">Your profile has been updated successfully.</p>
            <div className="w-12 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserUpdate;