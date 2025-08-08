import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './register.css';

// ✅ Helper to get CSRF token from cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const UserRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    try {
      // ✅ Ensure CSRF cookie is loaded
      await axios.get("/api/csrf/", { withCredentials: true });

      const csrfToken = getCookie("csrftoken");

      await axios.post("/api/register/", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
      });

      setSuccess("Registration successful!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ detail: "Something went wrong." });
      }
    }
  };

  return (
    <div className="register-container">
      <Link to="/" className="back-to-home">← Back to Home</Link>
      <h2 className="register-heading">User Registration</h2>

      {success && <div className="message success">{success}</div>}
      {errors.detail && <div className="message error">{errors.detail}</div>}

      <form onSubmit={handleSubmit}>
        {[
          "first_name",
          "last_name",
          "username",
          "email",
          "password",
          "confirm_password",
          "phone",
        ].map((field) => (
          <div key={field} className="form-group">
            <label className="form-label">{field.replace("_", " ")}</label>
            <input
              type={field.includes("password") ? "password" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="form-input"
              required
            />
            {errors[field] && (
              <div className="message error">{errors[field][0]}</div>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="register-btn"
        >
          Register
        </button>
      </form>

      <div className="auth-link-container">
        <p className="auth-link-text">
          {/* Uncomment if owner registration is enabled */}
          {/* Want to register as an owner?{" "}
          <Link to="/register-owner" className="auth-link">Register as Owner</Link> */}
        </p>
        <p className="auth-link-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default UserRegister;
