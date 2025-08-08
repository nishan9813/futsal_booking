// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const DEFAULT_PROFILE_PIC_URL = 'http://127.0.0.1:8000/media/defaults/pfp.png';

// const EditProfile = () => {
//   const [formData, setFormData] = useState({
//     id: '',
//     username: '',
//     first_name: '',
//     last_name: '',
//     email: '',
//     phone: '',
//     profile_pic: null,
//   });

//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // Create an axios instance with default config
//   const axiosInstance = axios.create({
//     baseURL: 'http://127.0.0.1:8000',
//     withCredentials: true,
//     xsrfCookieName: 'csrftoken',
//     xsrfHeaderName: 'X-CSRFToken',
//   });

//   useEffect(() => {
//     const loadUserData = async () => {
//       setLoading(true);
//       try {
//         // Get CSRF cookie first
//         await axiosInstance.get('/api/csrf/');
//         // Fetch current user data
//         const res = await axiosInstance.get('/api/current_user/');
//         const userData = res.data.user;

//         setFormData({
//           id: userData.id,
//           username: userData.username,
//           first_name: userData.first_name,
//           last_name: userData.last_name,
//           email: userData.email,
//           phone: userData.phone,
//           profile_pic: null,
//         });

//         setPreview(userData.profile_pic || DEFAULT_PROFILE_PIC_URL);
//         setError('');
//       } catch (err) {
//         console.error('Failed to load user data', err);
//         setError('Unable to fetch user details. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUserData();
//   }, []);

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setFormData((prev) => ({ ...prev, profile_pic: file }));
//     setPreview(URL.createObjectURL(file));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const data = new FormData();
//       data.append('username', formData.username);
//       data.append('first_name', formData.first_name);
//       data.append('last_name', formData.last_name);
//       data.append('email', formData.email);
//       data.append('phone', formData.phone);
//       if (formData.profile_pic) {
//         data.append('profile_pic', formData.profile_pic);
//       }

//       await axiosInstance.put(`/api/admin/users/${formData.id}/`, data, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       alert('Profile updated successfully!');
//     } catch (err) {
//       console.error('Update failed:', err);
//       setError('Failed to update profile. Please check your inputs or try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div style={{ maxWidth: '500px', margin: 'auto', padding: '2rem' }}>
//       <h2>Edit Profile</h2>
//       {error && <p style={{ color: 'red' }}>{error}</p>}

//       <form onSubmit={handleSubmit} encType="multipart/form-data">
//         <div>
//           <label>Username (read-only)</label>
//           <input
//             type="text"
//             name="username"
//             value={formData.username}
//             readOnly
//             style={{ backgroundColor: '#f0f0f0' }}
//           />
//         </div>

//         <div>
//           <label>First Name</label>
//           <input
//             type="text"
//             name="first_name"
//             value={formData.first_name}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div>
//           <label>Last Name</label>
//           <input
//             type="text"
//             name="last_name"
//             value={formData.last_name}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div>
//           <label>Email</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div>
//           <label>Phone</label>
//           <input
//             type="text"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div>
//           <label>Profile Picture</label>
//           <input type="file" accept="image/*" onChange={handleFileChange} />
//           {preview && (
//             <div style={{ marginTop: '10px' }}>
//               <img
//                 src={preview}
//                 alt="Profile preview"
//                 style={{ width: '100px', borderRadius: '8px' }}
//                 onError={(e) => {
//                   e.target.onerror = null;
//                   e.target.src = DEFAULT_PROFILE_PIC_URL;
//                 }}
//               />
//             </div>
//           )}
//         </div>

//         <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
//           {loading ? 'Saving...' : 'Save Changes'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default EditProfile;



import React, { useEffect, useState } from 'react';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

function EditProfile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        await axiosInstance.get('/api/csrf/');  // Set CSRF cookie
        const response = await axiosInstance.get('/api/current_user/');
        setUser(response.data.user);
        setError('');
      } catch (err) {
        setError('You are not authenticated or session expired.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Edit Profile</h2>
      <p>Username: {user.username}</p>
      {/* rest of your form here */}
    </div>
  );
}

export default EditProfile;
