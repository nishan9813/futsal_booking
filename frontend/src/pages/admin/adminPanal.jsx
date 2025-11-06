// // src/pages/admin/AdminPanel.jsx
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import axiosClient from "../../authenticated/axiosCredint";

// const EXCLUDED_FIELDS = ["password", "confirm_password"];

// export default function AdminPanel() {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Fetch users list
//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const res = await axiosClient.get("/api/admin-users/");
//       setUsers(res.data);
//       setError(null);
//     } catch (err) {
//       setError("Failed to load users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // Delete user
//   const deleteUser = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this user?")) return;

//     try {
//       await axiosClient.delete(`/api/admin-users/${id}/`);
//       fetchUsers();
//       if (selectedUser?.id === id) setSelectedUser(null);
//     } catch (err) {
//       alert("Failed to delete user");
//     }
//   };

//   // Update user
//   const updateUser = async () => {
//     if (!selectedUser) return;

//     try {
//       const formData = new FormData();

//       Object.keys(selectedUser).forEach((key) => {
//         if (EXCLUDED_FIELDS.includes(key) || key === "id") return;

//         if (key === "profile_pic") {
//           if (selectedUser.profile_pic instanceof File) {
//             formData.append("profile_pic", selectedUser.profile_pic);
//           }
//         } else {
//           formData.append(key, selectedUser[key] ?? "");
//         }
//       });

//       await axiosClient.patch(
//         `/api/admin-users/${selectedUser.id}/`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       alert("User updated successfully!");
//       fetchUsers();
//     } catch (err) {
//       alert("Failed to update user. Check required fields.");
//       console.error(err.response?.data || err);
//     }
//   };

//   // Handle input change
//   const handleInputChange = (e) => {
//     const { name, value, files } = e.target;

//     setSelectedUser((prev) => ({
//       ...prev,
//       [name]: name === "profile_pic" ? files[0] : value,
//     }));
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Admin User Management</h2>
//         <Link
//           to="/register"
//           className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
//         >
//           + Create User
//         </Link>
//       </div>

//       {loading && <p className="text-gray-500">Loading users...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       <div className="flex flex-col lg:flex-row gap-8">
//         {/* User list */}
//         <div className="flex-1 bg-white p-4 rounded shadow">
//           <h3 className="text-lg font-semibold mb-4">User List</h3>
//           <ul className="space-y-2">
//             {users.map((user) => (
//               <li key={user.id ?? user.username ?? Math.random()} className="flex justify-between items-center">
//                 <button
//                   onClick={() => setSelectedUser(user)}
//                   className={`text-left flex-1 ${
//                     selectedUser?.id === user.id ? "font-bold text-blue-600" : "text-gray-700"
//                   }`}
//                 >
//                   {user.username} ({user.email})
//                 </button>
//                 <button
//                   onClick={() => deleteUser(user.id)}
//                   className="text-red-600 hover:text-red-800"
//                 >
//                   Delete
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Selected user details */}
//         <div className="flex-1 bg-white p-4 rounded shadow">
//           {selectedUser ? (
//             <>
//               <h3 className="text-lg font-semibold mb-4">Edit User: {selectedUser.username}</h3>
//               <div className="space-y-3">
//                 <div>
//                   <label className="block text-gray-700">First Name:</label>
//                   <input
//                     name="first_name"
//                     value={selectedUser.first_name || ""}
//                     onChange={handleInputChange}
//                     className="w-full border rounded px-3 py-2 mt-1"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-gray-700">Last Name:</label>
//                   <input
//                     name="last_name"
//                     value={selectedUser.last_name || ""}
//                     onChange={handleInputChange}
//                     className="w-full border rounded px-3 py-2 mt-1"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-gray-700">Username:</label>
//                   <input
//                     name="username"
//                     value={selectedUser.username || ""}
//                     onChange={handleInputChange}
//                     className="w-full border rounded px-3 py-2 mt-1"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-gray-700">Email:</label>
//                   <input
//                     name="email"
//                     value={selectedUser.email || ""}
//                     onChange={handleInputChange}
//                     className="w-full border rounded px-3 py-2 mt-1"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-gray-700">Phone:</label>
//                   <input
//                     name="phone"
//                     value={selectedUser.phone || ""}
//                     onChange={handleInputChange}
//                     className="w-full border rounded px-3 py-2 mt-1"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-gray-700">Profile Picture:</label>
//                   <input
//                     type="file"
//                     name="profile_pic"
//                     accept="image/*"
//                     onChange={handleInputChange}
//                     className="mt-1"
//                   />
//                   {selectedUser.profile_pic && typeof selectedUser.profile_pic === "string" && (
//                     <div className="mt-2">
//                       <p className="text-gray-600">Current Picture:</p>
//                       <img
//                         src={selectedUser.profile_pic}
//                         alt="Profile"
//                         className="w-20 h-20 object-cover rounded mt-1"
//                       />
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex gap-3 mt-4">
//                   <button
//                     onClick={updateUser}
//                     className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//                   >
//                     Save Changes
//                   </button>
//                   <button
//                     onClick={() => setSelectedUser(null)}
//                     className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <p className="text-gray-600">Select a user to edit</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// src/pages/admin/AdminPanel.jsx
import React, { useState } from "react";
import { 
  Shield, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Building, 
  Calendar 
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import UserManagement from "./components/UserManagenmant";
import OwnerManagement from "./components/OwnerManagenment";
import GroundManagement from "./components/GroundManagenmeny";
import BookingManagement from "./components/BookingManagenment";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'owners', label: 'Owners', icon: UserCheck },
    { id: 'grounds', label: 'Grounds', icon: Building },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'owners':
        return <OwnerManagement />;
      case 'grounds':
        return <GroundManagement />;
      case 'bookings':
        return <BookingManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your futsal booking platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;