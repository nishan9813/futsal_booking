import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from './axiosCredint'; // Your configured Axios instance
import './Login.css'; // Import the CSS file

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Helper to extract CSRF token from cookie
  const getCsrfToken = () => {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))
      ?.split('=')[1];
  };

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        await axiosClient.get('/api/csrf/');
      } catch (err) {
        console.error('CSRF token initialization failed:', err);
      }
    };
    fetchCsrfToken();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loginData = {
        username: form.username,
        password: form.password,
      };

      const response = await axiosClient.post('/api/login/', loginData, {
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      });

      if (response.status === 200) {
        console.log('Login successful:', response.data);
        navigate('/');
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400) {
          errorMessage = data?.non_field_errors?.[0] || 'Invalid credentials';
        } else if (status === 403) {
          errorMessage = 'Session expired or CSRF failed. Please refresh the page.';
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data?.detail) {
          errorMessage = data.detail;
        }
      }
      console.error('Login failed:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Link to="/" className="back-to-home">← Back to Home</Link>
      <h2 className="login-heading">Login</h2>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your username"
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="button"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="auth-link-container">
        <p className="auth-link-text">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">Register as User</Link> or{" "}
          {/* <Link to="/register-owner" className="auth-link">Register as Owner</Link> */}
        </p>
        <p className="auth-link-text">
          <Link to="/register" className="auth-link">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
