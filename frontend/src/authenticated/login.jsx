// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axiosClient from "./axiosCredint";
// import "./Login.css";

// const Login = () => {
//   const [form, setForm] = useState({ username: "", password: "" });
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       const loginData = {
//         username: form.username,
//         password: form.password,
//       };

//       const response = await axiosClient.post("/api/token/", loginData);

//       if (response.status === 200) {
//         const { access, refresh, username, email, role } = response.data;

//         localStorage.setItem("access_token", access);
//         localStorage.setItem("refresh_token", refresh);
//         localStorage.setItem("username", username);
//         localStorage.setItem("email", email);
//         localStorage.setItem("role", role);

//         navigate("/");
//       }
//     } catch (err) {
//       let errorMessage = "Login failed. Please try again.";
//       if (err.response) {
//         const { status, data } = err.response;
//         if (status === 400) {
//           errorMessage = data?.non_field_errors?.[0] || "Invalid credentials";
//         } else if (status === 401) {
//           errorMessage = "Unauthorized: Invalid username or password";
//         } else if (data?.detail) {
//           errorMessage = data.detail;
//         }
//       }
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       <Link to="/" className="back-to-home">
//         ← Back to Home
//       </Link>
//       <h2 className="login-heading">Login</h2>
//       {error && <div className="error-box">{error}</div>}
//       <form onSubmit={handleLogin}>
//         <div className="form-group">
//           <label htmlFor="username" className="form-label">
//             Username
//           </label>
//           <input
//             id="username"
//             name="username"
//             value={form.username}
//             onChange={handleChange}
//             className="form-input"
//             placeholder="Enter your username"
//             required
//             disabled={isLoading}
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="password" className="form-label">
//             Password
//           </label>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             value={form.password}
//             onChange={handleChange}
//             className="form-input"
//             placeholder="Enter your password"
//             required
//             disabled={isLoading}
//           />
//         </div>
//         <button type="submit" className="button" disabled={isLoading}>
//           {isLoading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "./axiosCredint";
import "./Login.css";

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
    <div className="login-wrapper">
      <div className="login-card animate-slide-up">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to book your futsal slot</p>

        {error && <div className="error-message animate-fade">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <p className="register-text">
          Don’t have an account?{" "}
          <Link to="/register" className="register-link">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
