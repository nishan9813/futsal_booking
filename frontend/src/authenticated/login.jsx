import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "./axiosCredint";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loginData = {
        username: form.username,
        password: form.password,
      };

      const response = await axiosClient.post("/api/token/", loginData);

      if (response.status === 200) {
        const { access, refresh, username, email, role } = response.data;

        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        localStorage.setItem("username", username);
        localStorage.setItem("email", email);
        localStorage.setItem("role", role);

        navigate("/");
      }
    } catch (err) {
      let errorMessage = "Login failed. Please try again.";
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400) {
          errorMessage = data?.non_field_errors?.[0] || "Invalid credentials";
        } else if (status === 401) {
          errorMessage = "Unauthorized: Invalid username or password";
        } else if (data?.detail) {
          errorMessage = data.detail;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/video/Paola Gabriela Sanes -Via KLICKPIN CF.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-90 shadow-xl rounded-2xl animate-slide-up">

        <Link
          to="/"
          className="text-indigo-500 hover:text-indigo-700 font-medium text-sm mb-4 inline-block"
        >
          ← Back to Home
        </Link>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-gray-500 mb-6">Sign in to book your futsal slot</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-fade">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex flex-col">
            <label htmlFor="username" className="mb-2 text-gray-600 font-medium">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              disabled={isLoading}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-gray-100"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="mb-2 text-gray-600 font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-500 hover:text-indigo-700 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
