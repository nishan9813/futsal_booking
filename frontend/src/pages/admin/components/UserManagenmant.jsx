// src/pages/admin/components/UserManagement.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../../authenticated/axiosCredint";

const EXCLUDED_FIELDS = ["password", "confirm_password"];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/api/admin-users/");
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axiosClient.delete(`/api/admin-users/${id}/`);
      fetchUsers();
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const formData = new FormData();

      Object.keys(selectedUser).forEach((key) => {
        if (EXCLUDED_FIELDS.includes(key) || key === "id") return;

        if (key === "profile_pic") {
          if (selectedUser.profile_pic instanceof File) {
            formData.append("profile_pic", selectedUser.profile_pic);
          }
        } else {
          formData.append(key, selectedUser[key] ?? "");
        }
      });

      await axiosClient.patch(
        `/api/admin-users/${selectedUser.id}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("User updated successfully!");
      fetchUsers();
    } catch (err) {
      alert("Failed to update user. Check required fields.");
      console.error(err.response?.data || err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setSelectedUser((prev) => ({
      ...prev,
      [name]: name === "profile_pic" ? files[0] : value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <Link
          to="/register"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          + Create User
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* User list */}
        <div className="flex-1 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">User List</h3>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <button
                  onClick={() => setSelectedUser(user)}
                  className={`text-left flex-1 ${
                    selectedUser?.id === user.id ? "font-bold text-blue-600" : "text-gray-700"
                  }`}
                >
                  {user.username} ({user.email})
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected user details */}
        <div className="flex-1 bg-white p-4 rounded shadow">
          {selectedUser ? (
            <>
              <h3 className="text-lg font-semibold mb-4">Edit User: {selectedUser.username}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700">First Name:</label>
                  <input
                    name="first_name"
                    value={selectedUser.first_name || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Last Name:</label>
                  <input
                    name="last_name"
                    value={selectedUser.last_name || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Username:</label>
                  <input
                    name="username"
                    value={selectedUser.username || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Email:</label>
                  <input
                    name="email"
                    value={selectedUser.email || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Phone:</label>
                  <input
                    name="phone"
                    value={selectedUser.phone || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Profile Picture:</label>
                  <input
                    type="file"
                    name="profile_pic"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  {selectedUser.profile_pic && typeof selectedUser.profile_pic === "string" && (
                    <div className="mt-2">
                      <p className="text-gray-600">Current Picture:</p>
                      <img
                        src={selectedUser.profile_pic}
                        alt="Profile"
                        className="w-20 h-20 object-cover rounded mt-1"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={updateUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-600">Select a user to edit</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;