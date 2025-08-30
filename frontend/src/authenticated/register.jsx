
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const UserRegister = () => {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkIfOwner() {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await axios.get("http://127.0.0.1:8000/api/current_user/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.user?.role === "owner") {
          navigate("/", { replace: true });
        }
      } catch {
        // ignore
      }
    }
    checkIfOwner();
  }, [navigate]);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    if (formData.password !== formData.confirm_password) {
      setErrors({ confirm_password: ["Passwords do not match."] });
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/register/", {
        ...formData,
        phone: `+977${formData.phone}`, // Always send full number
      });

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ detail: "Something went wrong. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<div className="relative min-h-screen flex items-center justify-center bg-gray-900">
  {/* Background Video */}
  <video
    autoPlay
    loop
    muted
    className="absolute inset-0 w-full h-full object-cover z-0"
  >
    <source src="/video/Paola Gabriela Sanes -Via KLICKPIN CF.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  {/* Form Container */}
  <div className="relative z-10 w-full max-w-lg p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl animate-slide-up">
    <Link
      to="/"
      className="text-indigo-500 hover:text-indigo-700 font-medium text-sm mb-4 inline-block"
    >
      ← Back to Home
    </Link>

    <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Your Account</h2>
    <p className="text-gray-500 mb-6">
      Join us and start booking your futsal slots today!
    </p>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 animate-fade">
            {success}
          </div>
        )}
        {errors.detail && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-fade">
            {errors.detail}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-2 text-gray-600 font-medium">First Name</label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-gray-100"
              />
              {errors.first_name && <div className="text-red-600 mt-1 text-sm">{errors.first_name[0]}</div>}
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-gray-600 font-medium">Last Name</label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-gray-100"
              />
              {errors.last_name && <div className="text-red-600 mt-1 text-sm">{errors.last_name[0]}</div>}
            </div>
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-2 text-gray-600 font-medium">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-gray-100"
              />
              {errors.username && <div className="text-red-600 mt-1 text-sm">{errors.username[0]}</div>}
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-gray-600 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-gray-100"
              />
              {errors.email && <div className="text-red-600 mt-1 text-sm">{errors.email[0]}</div>}
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-2 text-gray-600 font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-gray-100"
              />
              {errors.password && <div className="text-red-600 mt-1 text-sm">{errors.password[0]}</div>}
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-gray-600 font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-gray-100"
              />
              {errors.confirm_password && <div className="text-red-600 mt-1 text-sm">{errors.confirm_password[0]}</div>}
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="mb-2 text-gray-600 font-medium">Phone</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400">
              <span className="px-3 bg-gray-100 text-gray-700 select-none">🇳🇵 +977</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData((prev) => ({ ...prev, phone: digitsOnly }));
                }}
                placeholder="98XXXXXXXXX"
                required
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 focus:outline-none disabled:bg-gray-100"
              />
            </div>
            {errors.phone && <div className="text-red-600 mt-1 text-sm">{errors.phone[0]}</div>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-500 hover:text-indigo-700 font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>

  );
};

export default UserRegister;
