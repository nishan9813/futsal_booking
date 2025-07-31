// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axiosClient from './axiosCredint'; // your configured axios instance

// const Login = () => {
//   const [form, setForm] = useState({ username: '', password: '' });
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   // Fetch CSRF token on component mount to set cookie
//   useEffect(() => {
//     const fetchCsrfToken = async () => {
//       try {
//         await axiosClient.get('/api/csrf/');
//       } catch (err) {
//         console.error('CSRF token initialization failed:', err);
//       }
//     };
//     fetchCsrfToken();
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       const loginData = {
//         username: form.username,
//         password: form.password,
//       };

//       const response = await axiosClient.post('/api/login/', loginData);

//       if (response.status === 200) {
//         console.log('Login successful:', response.data);
//         navigate('/');
//       }
//     } catch (err) {
//       let errorMessage = 'Login failed. Please try again.';
//       if (err.response) {
//         const { status, data } = err.response;

//         if (status === 400) {
//           errorMessage = data?.non_field_errors?.[0] || 'Invalid credentials';
//         } else if (status === 403) {
//           errorMessage = 'Session expired or CSRF failed. Please refresh the page.';
//         } else if (typeof data === 'string') {
//           errorMessage = data;
//         } else if (data?.detail) {
//           errorMessage = data.detail;
//         }
//       }
//       console.error('Login failed:', err);
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };


//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
//       <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
//       {error && (
//         <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
//           {error}
//         </div>
//       )}
//       <form onSubmit={handleLogin}>
//         <div className="mb-4">
//           <label htmlFor="username" className="block text-gray-700 mb-2">
//             Username
//           </label>
//           <input
//             id="username"
//             name="username"
//             value={form.username}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter your username"
//             required
//             disabled={isLoading}
//           />
//         </div>
//         <div className="mb-6">
//           <label htmlFor="password" className="block text-gray-700 mb-2">
//             Password
//           </label>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             value={form.password}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter your password"
//             required
//             disabled={isLoading}
//           />
//         </div>
//         <button
//           type="submit"
//           className={`w-full py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
//             isLoading
//               ? 'bg-gray-400 cursor-not-allowed'
//               : 'bg-blue-600 text-white hover:bg-blue-700'
//           }`}
//           disabled={isLoading}
//         >
//           {isLoading ? 'Logging in...' : 'Login'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from './axiosCredint'; // Your configured Axios instance

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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 mb-2">
            Username
          </label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
            required
            disabled={isLoading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
