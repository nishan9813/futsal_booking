// import React, { useState, useEffect } from 'react';
// import axiosClient from '../authenticated/axiosCredint';
// import './UserUpdate.css';

// const UserUpdate = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     first_name: '',
//     last_name: '',
//     phone: '',
//     profile_pic: null,
//     old_password: '',
//     new_password: '',
//     new_password_confirm: '',
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

//   useEffect(() => {
//     axiosClient.get('/api/userUpdate/')
//       .then(res => {
//         setFormData(prev => ({
//           ...prev,
//           ...res.data,
//           profile_pic: res.data.profile_pic || null, // backend URL
//           old_password: '',
//           new_password: '',
//           new_password_confirm: '',
//         }));
//         setLoading(false);
//       })
//       .catch(() => {
//         setError('Failed to load user data.');
//         setLoading(false);
//       });
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === 'profile_pic') {
//       setFormData(prev => ({
//         ...prev,
//         profile_pic: files[0] || null
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError('');

//     const data = new FormData();
//     data.append('username', formData.username);
//     data.append('email', formData.email);
//     data.append('first_name', formData.first_name || '');
//     data.append('last_name', formData.last_name || '');
//     data.append('phone', formData.phone || '');
//     if (formData.profile_pic instanceof File) {
//       data.append('profile_pic', formData.profile_pic);
//     }
//     if (formData.old_password || formData.new_password || formData.new_password_confirm) {
//       data.append('old_password', formData.old_password);
//       data.append('new_password', formData.new_password);
//       data.append('new_password_confirm', formData.new_password_confirm);
//     }

//     axiosClient.patch('/api/userUpdate/', data, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     })
//       .then(() => {
//         setShowSuccessOverlay(true);
//         setTimeout(() => window.location.reload(), 2000);
//       })
//       .catch(err => {
//         if (err.response && err.response.data) {
//           setError(JSON.stringify(err.response.data, null, 2));
//         } else {
//           setError('Update failed. Please try again.');
//         }
//       });
//   };

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="user-update-container">
//       <h2>Update Profile</h2>

//       {error && <div className="error-message">{error}</div>}

//       {/* Profile Picture Preview */}
//       <div className="profile-pic-preview-container" onClick={() => document.getElementById('profilePicInput').click()}>
//         <img
//           src={
//             formData.profile_pic
//               ? formData.profile_pic instanceof File
//                 ? URL.createObjectURL(formData.profile_pic)
//                 : formData.profile_pic // backend URL
//               : '/placeholder-profile.png'
//           }
//           alt="Profile Preview"
//           className="profile-pic-preview"
//         />
//       </div>

//       <form onSubmit={handleSubmit} encType="multipart/form-data">
//         <div>
//           <label>Username</label><br />
//           <input type="text" name="username" value={formData.username} onChange={handleChange} required />
//         </div>

//         <div>
//           <label>Email</label><br />
//           <input type="email" name="email" value={formData.email} onChange={handleChange} required />
//         </div>

//         <div>
//           <label>First Name</label><br />
//           <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
//         </div>

//         <div>
//           <label>Last Name</label><br />
//           <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
//         </div>

//         <div>
//           <label>Phone</label><br />
//           <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
//         </div>

//         <div style={{ display: 'none' }}>
//           <input
//             id="profilePicInput"
//             type="file"
//             name="profile_pic"
//             accept="image/*"
//             onChange={handleChange}
//           />
//         </div>

//         <hr />

//         <div>
//           <label>Old Password</label><br />
//           <input type="password" name="old_password" value={formData.old_password} onChange={handleChange} placeholder="Enter old password to change" />
//         </div>

//         <div>
//           <label>New Password</label><br />
//           <input type="password" name="new_password" value={formData.new_password} onChange={handleChange} />
//         </div>

//         <div>
//           <label>Confirm New Password</label><br />
//           <input type="password" name="new_password_confirm" value={formData.new_password_confirm} onChange={handleChange} />
//         </div>

//         <button type="submit" style={{ marginTop: 15 }}>Update Profile</button>
//       </form>

//       {showSuccessOverlay && (
//         <div className="success-overlay">
//           <div className="success-content">
//             <div className="success-icon">✅</div>
//             <h1>Profile Updated Successfully!</h1>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserUpdate;



import React, { useState, useEffect } from 'react';
import axiosClient from '../authenticated/axiosCredint';
import './UserUpdate.css';

const UserUpdate = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '+977', // default prefix
    profile_pic: null,
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  useEffect(() => {
    axiosClient.get('/api/userUpdate/')
      .then(res => {
        setFormData(prev => ({
          ...prev,
          ...res.data,
          profile_pic: res.data.profile_pic || null,
          old_password: '',
          new_password: '',
          new_password_confirm: '',
          phone: res.data.phone ? res.data.phone : '+977', // keep +977 if no phone
        }));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load user data.');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_pic') {
      setFormData(prev => ({
        ...prev,
        profile_pic: files[0] || null
      }));
    } else if (name === 'phone') {
      // Ensure phone always starts with +977
      let newVal = value.startsWith('+977') ? value : '+977' + value.replace(/\+977/, '');
      setFormData(prev => ({
        ...prev,
        phone: newVal
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('first_name', formData.first_name || '');
    data.append('last_name', formData.last_name || '');
    data.append('phone', formData.phone || '');
    if (formData.profile_pic instanceof File) {
      data.append('profile_pic', formData.profile_pic);
    }
    if (formData.old_password || formData.new_password || formData.new_password_confirm) {
      data.append('old_password', formData.old_password);
      data.append('new_password', formData.new_password);
      data.append('new_password_confirm', formData.new_password_confirm);
    }

    axiosClient.patch('/api/userUpdate/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(() => {
        setShowSuccessOverlay(true);
        setTimeout(() => window.location.reload(), 2000);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          setError(JSON.stringify(err.response.data, null, 2));
        } else {
          setError('Update failed. Please try again.');
        }
      });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-update-container">
      <h2>Update Profile</h2>

      {error && <div className="error-message">{error}</div>}

      {/* Profile Picture Preview */}
      <div className="profile-pic-preview-container" onClick={() => document.getElementById('profilePicInput').click()}>
        <img
          src={
            formData.profile_pic
              ? formData.profile_pic instanceof File
                ? URL.createObjectURL(formData.profile_pic)
                : formData.profile_pic
              : '/placeholder-profile.png'
          }
          alt="Profile Preview"
          className="profile-pic-preview"
        />
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Username</label><br />
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>

        <div>
          <label>Email</label><br />
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div>
          <label>First Name</label><br />
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
        </div>

        <div>
          <label>Last Name</label><br />
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
        </div>

        <div>
          <label>Phone</label><br />
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </div>

        <div style={{ display: 'none' }}>
          <input
            id="profilePicInput"
            type="file"
            name="profile_pic"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <hr />

        <div>
          <label>Old Password</label><br />
          <input type="password" name="old_password" value={formData.old_password} onChange={handleChange} placeholder="Enter old password to change" />
        </div>

        <div>
          <label>New Password</label><br />
          <input type="password" name="new_password" value={formData.new_password} onChange={handleChange} />
        </div>

        <div>
          <label>Confirm New Password</label><br />
          <input type="password" name="new_password_confirm" value={formData.new_password_confirm} onChange={handleChange} />
        </div>

        <button type="submit" style={{ marginTop: 15 }}>Update Profile</button>
      </form>

      {showSuccessOverlay && (
        <div className="success-overlay">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h1>Profile Updated Successfully!</h1>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserUpdate;
