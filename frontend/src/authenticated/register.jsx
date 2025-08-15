// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import './register.css';

// const UserRegister = () => {
//   const navigate = useNavigate();

//   // Redirect if user is already owner
//   useEffect(() => {
//     async function checkIfOwner() {
//       const token = localStorage.getItem("access_token");
//       if (!token) return; // no token, so no redirect

//       try {
//         const res = await axios.get("http://127.0.0.1:8000/api/current_user/", {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });

//         if (res.data.user?.role === "owner") {
//           navigate("/", { replace: true });
//         }
//       } catch (error) {
//         // ignore errors, allow registration form to show
//       }
//     }

//     checkIfOwner();
//   }, [navigate]);

//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     username: "",
//     email: "",
//     password: "",
//     confirm_password: "",
//     phone: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [success, setSuccess] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});
//     setSuccess("");
//     setIsSubmitting(true);

//     if (formData.password !== formData.confirm_password) {
//       setErrors({ confirm_password: ["Passwords do not match."] });
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       await axios.post("http://127.0.0.1:8000/api/register/", formData);
//       setSuccess("Registration successful! Redirecting to login...");
//       setTimeout(() => navigate("/login"), 1500);
//     } catch (error) {
//       if (error.response?.data) {
//         setErrors(error.response.data);
//       } else {
//         setErrors({ detail: "Something went wrong. Please try again." });
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="register-container">
//       <Link to="/" className="back-to-home">← Back to Home</Link>
//       <h2 className="register-heading">User Registration</h2>

//       {success && <div className="message success">{success}</div>}
//       {errors.detail && <div className="message error">{errors.detail}</div>}

//       <form onSubmit={handleSubmit}>
//         {[
//           "first_name",
//           "last_name",
//           "username",
//           "email",
//           "password",
//           "confirm_password",
//           "phone",
//         ].map((field) => (
//           <div key={field} className="form-group">
//             <label className="form-label" htmlFor={field}>
//               {field.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
//             </label>
//             <input
//               id={field}
//               type={field.includes("password") ? "password" : "text"}
//               name={field}
//               value={formData[field]}
//               onChange={handleChange}
//               className="form-input"
//               required
//               disabled={isSubmitting}
//               autoComplete={field.includes("password") ? "new-password" : "off"}
//             />
//             {errors[field] && (
//               <div className="message error">{errors[field][0]}</div>
//             )}
//           </div>
//         ))}

//         <button
//           type="submit"
//           className="register-btn"
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? "Registering..." : "Register"}
//         </button>
//       </form>

//       <div className="auth-link-container">
//         <p className="auth-link-text">
//           {/* Uncomment if owner registration is enabled */}
//           {/* Want to register as an owner?{" "}
//           <Link to="/register-owner" className="auth-link">Register as Owner</Link> */}
//         </p>
//         <p className="auth-link-text">
//           Already have an account?{" "}
//           <Link to="/login" className="auth-link">Login here</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default UserRegister;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./register.css";

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
    <div className="register-wrapper">
      <div className="register-card animate-slide-up">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h2 className="register-title">Create Your Account</h2>
        <p className="register-subtitle">
          Join us and start booking your futsal slots today!
        </p>

        {success && <div className="message success animate-fade">{success}</div>}
        {errors.detail && <div className="message error animate-fade">{errors.detail}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {errors.first_name && <div className="message error">{errors.first_name[0]}</div>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {errors.last_name && <div className="message error">{errors.last_name[0]}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {errors.username && <div className="message error">{errors.username[0]}</div>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {errors.email && <div className="message error">{errors.email[0]}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {errors.password && <div className="message error">{errors.password[0]}</div>}
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {errors.confirm_password && (
                <div className="message error">{errors.confirm_password[0]}</div>
              )}
            </div>
          </div>

          {/* ---------------- PHONE NUMBER ---------------- */}
          <div className="form-group">
            <label>Phone</label>
            <div className="phone-input-wrapper">
              <span className="phone-prefix">🇳🇵 +977</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  // Only allow numbers, max 10 digits
                  const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData((prev) => ({
                    ...prev,
                    phone: digitsOnly,
                  }));
                }}
                placeholder="98XXXXXXXXX"
                required
                disabled={isSubmitting}
              />
            </div>
            {errors.phone && <div className="message error">{errors.phone[0]}</div>}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="auth-link-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default UserRegister;
