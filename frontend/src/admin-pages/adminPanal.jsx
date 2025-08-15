// src/pages/admin/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../authenticated/axiosCredint";

const EXCLUDED_FIELDS = ["password", "confirm_password"];

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users list
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

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axiosClient.delete(`/api/admin-users/${id}/`);
      fetchUsers(); // refresh list
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  // Update user
  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const formData = new FormData();

      Object.keys(selectedUser).forEach((key) => {
        if (EXCLUDED_FIELDS.includes(key) || key === "id") return;

        // Only append profile_pic if it's a File object (new upload)
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

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    setSelectedUser((prev) => ({
      ...prev,
      [name]: name === "profile_pic" ? files[0] : value,
    }));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin User Management</h2>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", gap: "40px" }}>
        {/* User list */}
        <div style={{ flex: 1 }}>
          <h3>User List</h3>
          <ul>
            {users.map((user) => (
              <li key={user.id ?? user.username ?? Math.random()}>
                <button
                  onClick={() => setSelectedUser(user)}
                  style={{
                    fontWeight: selectedUser?.id === user.id ? "bold" : "normal",
                  }}
                >
                  {user.username} ({user.email})
                </button>{" "}
                <button
                  onClick={() => deleteUser(user.id)}
                  style={{ color: "red" }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected user details */}
        <div style={{ flex: 1 }}>
          {selectedUser ? (
            <>
              <h3>Edit User: {selectedUser.username}</h3>
              <label>
                First Name:
                <input
                  name="first_name"
                  value={selectedUser.first_name || ""}
                  onChange={handleInputChange}
                />
              </label>
              <br />
              <label>
                Last Name:
                <input
                  name="last_name"
                  value={selectedUser.last_name || ""}
                  onChange={handleInputChange}
                />
              </label>
              <br />
              <label>
                Username:
                <input
                  name="username"
                  value={selectedUser.username || ""}
                  onChange={handleInputChange}
                />
              </label>
              <br />
              <label>
                Email:
                <input
                  name="email"
                  value={selectedUser.email || ""}
                  onChange={handleInputChange}
                />
              </label>
              <br />
              <label>
                Phone:
                <input
                  name="phone"
                  value={selectedUser.phone || ""}
                  onChange={handleInputChange}
                />
              </label>
              <br />
              <label>
                Profile Picture:
                <input
                  type="file"
                  name="profile_pic"
                  accept="image/*"
                  onChange={handleInputChange}
                />
              </label>
              {selectedUser.profile_pic && typeof selectedUser.profile_pic === "string" && (
                <div>
                  <p>Current Picture:</p>
                  <img
                    src={selectedUser.profile_pic}
                    alt="Profile"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                </div>
              )}
              <br />
              <button onClick={updateUser}>Save Changes</button>
              <button
                onClick={() => setSelectedUser(null)}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </button>
            </>
          ) : (
            <p>Select a user to edit</p>
          )}
        </div>
      </div>
    </div>
  );
}
