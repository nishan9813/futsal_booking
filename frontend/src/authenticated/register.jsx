import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Get CSRF token from cookies
const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
};

const initialGround = {
  ground_type: '',
  opening_time: '05:00',
  closing_time: '22:00',
  price: '',
};

const RegisterPage = () => {
  const [role, setRole] = useState('user'); // user or owner
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // User form state
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  // Owner form state with grounds array
  const [ownerForm, setOwnerForm] = useState({
    user: {
      username: '',
      email: '',
      password: '',
      confirm_password: '',
      first_name: '',
      last_name: '',
      phone: '',
    },
    futsal_name: '',
    location: '',
    grounds: [{ ...initialGround }],
  });

  useEffect(() => {
    // Fetch CSRF token once on mount
    axios.get('csrf/', { withCredentials: true }).catch(console.error);
  }, []);

  // Handle user form change
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle owner form change for top-level and nested user fields
  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    const userFields = ['username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'phone'];
    if (userFields.includes(name)) {
      setOwnerForm(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [name]: value,
        },
      }));
    } else {
      setOwnerForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle grounds array fields change
  const handleGroundChange = (index, e) => {
    const { name, value } = e.target;
    setOwnerForm(prev => {
      const newGrounds = [...prev.grounds];
      newGrounds[index] = { ...newGrounds[index], [name]: value };
      return { ...prev, grounds: newGrounds };
    });
  };

  // Add new ground
  const addGround = () => {
    setOwnerForm(prev => ({
      ...prev,
      grounds: [...prev.grounds, { ...initialGround }],
    }));
  };

  // Remove ground by index
  const removeGround = (index) => {
    setOwnerForm(prev => {
      const newGrounds = prev.grounds.filter((_, i) => i !== index);
      return { ...prev, grounds: newGrounds.length ? newGrounds : [{ ...initialGround }] };
    });
  };

  // Validate passwords match
  const validatePasswords = (pass, confirm) => pass === confirm;

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const formData = role === 'user' ? userForm : ownerForm;

    if (role === 'user' && !validatePasswords(formData.password, formData.confirm_password)) {
      setMessage('❌ Password and Confirm Password do not match');
      return;
    }
    if (role === 'owner' && !validatePasswords(formData.user.password, formData.user.confirm_password)) {
      setMessage('❌ Password and Confirm Password do not match');
      return;
    }

    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) throw new Error('CSRF token missing. Refresh the page.');

      const registerUrl = role === 'user' ? 'api/register/' : 'api/register-owner/';

      await axios.post(registerUrl, formData, {
        headers: { 'X-CSRFToken': csrfToken },
        withCredentials: true,
      });

      // Auto-login after registration
      await axios.post('/api/login/', {
        username: role === 'user' ? userForm.username : ownerForm.user.username,
        password: role === 'user' ? userForm.password : ownerForm.user.password,
      }, {
        headers: { 'X-CSRFToken': csrfToken },
        withCredentials: true,
      });

      setMessage('✅ Registration and login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1500);

    } catch (err) {
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data ||
        err.message ||
        'Something went wrong';
      setMessage('❌ ' + JSON.stringify(errMsg));
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Register as {role === 'user' ? 'User' : 'Owner'}</h2>

      <div style={{ marginBottom: 20 }}>
        <button disabled={role === 'user'} onClick={() => setRole('user')} style={{ marginRight: 10 }}>User</button>
        <button disabled={role === 'owner'} onClick={() => setRole('owner')}>Owner</button>
      </div>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>

        {role === 'user' && (
          <>
            <input name="first_name" placeholder="First Name" value={userForm.first_name} onChange={handleUserChange} required />
            <input name="last_name" placeholder="Last Name" value={userForm.last_name} onChange={handleUserChange} required />
            <input name="username" placeholder="Username" value={userForm.username} onChange={handleUserChange} required />
            <input type="email" name="email" placeholder="Email" value={userForm.email} onChange={handleUserChange} required />
            <input name="phone" placeholder="Phone Number" value={userForm.phone} onChange={handleUserChange} />
            <input type="password" name="password" placeholder="Password" value={userForm.password} onChange={handleUserChange} required autoComplete="new-password" />
            <input type="password" name="confirm_password" placeholder="Confirm Password" value={userForm.confirm_password} onChange={handleUserChange} required autoComplete="new-password" />
          </>
        )}

        {role === 'owner' && (
          <>
            <input name="futsal_name" placeholder="Futsal Name" value={ownerForm.futsal_name} onChange={handleOwnerChange} required />
            <input name="location" placeholder="Location" value={ownerForm.location} onChange={handleOwnerChange} required />

            <input name="first_name" placeholder="First Name" value={ownerForm.user.first_name} onChange={handleOwnerChange} required />
            <input name="last_name" placeholder="Last Name" value={ownerForm.user.last_name} onChange={handleOwnerChange} required />
            <input name="username" placeholder="Username" value={ownerForm.user.username} onChange={handleOwnerChange} required />
            <input type="email" name="email" placeholder="Email" value={ownerForm.user.email} onChange={handleOwnerChange} required />
            <input name="phone" placeholder="Phone Number" value={ownerForm.user.phone} onChange={handleOwnerChange} />
            <input type="password" name="password" placeholder="Password" value={ownerForm.user.password} onChange={handleOwnerChange} required autoComplete="new-password" />
            <input type="password" name="confirm_password" placeholder="Confirm Password" value={ownerForm.user.confirm_password} onChange={handleOwnerChange} required autoComplete="new-password" />

            <h3>Grounds</h3>
            {ownerForm.grounds.map((ground, idx) => (
              <div key={idx} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
                <select
                  name="ground_type"
                  value={ground.ground_type}
                  onChange={(e) => handleGroundChange(idx, e)}
                  required
                >
                  <option value="">Select Ground Type</option>
                  <option value="5A">5-a-side</option>
                  <option value="7A">7-a-side</option>
                  <option value="MAT">Mat Futsal</option>
                  <option value="TURF">Turf</option>
                  <option value="WOOD">Wooden Floor</option>
                </select>

                <input
                  type="time"
                  name="opening_time"
                  value={ground.opening_time}
                  onChange={(e) => handleGroundChange(idx, e)}
                  required
                />
                <input
                  type="time"
                  name="closing_time"
                  value={ground.closing_time}
                  onChange={(e) => handleGroundChange(idx, e)}
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={ground.price}
                  onChange={(e) => handleGroundChange(idx, e)}
                  required
                  min="0"
                />
                <button type="button" onClick={() => removeGround(idx)} disabled={ownerForm.grounds.length === 1}>
                  Remove Ground
                </button>
              </div>
            ))}

            <button type="button" onClick={addGround}>Add Another Ground</button>
          </>
        )}

        <button type="submit" style={{ marginTop: 15 }}>
          Register as {role === 'user' ? 'User' : 'Owner'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;









// import React, { useState, useEffect } from 'react';
// import axiosClient from './axiosCredint';
// import { useNavigate } from 'react-router-dom';

// const RegisterPage = () => {
//   const navigate = useNavigate();
//   const [role, setRole] = useState('user');
//   const [csrfToken, setCsrfToken] = useState('');

//   const initialUser = {
//     first_name: '',
//     last_name: '',
//     username: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirm_password: '',
//     profile_pic: null,
//   };

//   const initialGround = {
//     ground_type: '',
//     opening_time: '05:00',
//     closing_time: '22:00',
//     price: '',
//     image: null,
//   };

//   const [userForm, setUserForm] = useState(initialUser);
//   const [ownerForm, setOwnerForm] = useState({
//     user: initialUser,
//     futsal_name: '',
//     location: '',
//     grounds: [initialGround],
//   });

//   useEffect(() => {
//     axiosClient.get('/api/csrf/', { withCredentials: true })
//       .then(res => {
//         const csrfToken = res.data.csrfToken || res.headers['x-csrftoken'];
//         setCsrfToken(csrfToken);
//       });
//   }, []);

//   const handleUserChange = (e) => {
//     const { name, value, files } = e.target;
//     setUserForm(prev => ({
//       ...prev,
//       [name]: files ? files[0] : value,
//     }));
//   };

//   const handleOwnerUserChange = (e) => {
//     const { name, value, files } = e.target;
//     setOwnerForm(prev => ({
//       ...prev,
//       user: {
//         ...prev.user,
//         [name]: files ? files[0] : value,
//       },
//     }));
//   };

//   const handleGroundChange = (index, e) => {
//     const { name, value, files } = e.target;
//     const newGrounds = [...ownerForm.grounds];
//     newGrounds[index] = {
//       ...newGrounds[index],
//       [name]: files ? files[0] : value,
//     };
//     setOwnerForm(prev => ({ ...prev, grounds: newGrounds }));
//   };

//   const addGround = () => {
//     setOwnerForm(prev => ({
//       ...prev,
//       grounds: [...prev.grounds, initialGround],
//     }));
//   };

//   const removeGround = (index) => {
//     const newGrounds = [...ownerForm.grounds];
//     newGrounds.splice(index, 1);
//     setOwnerForm(prev => ({
//       ...prev,
//       grounds: newGrounds,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       if (role === 'user') {
//         const formData = new FormData();
//         Object.entries(userForm).forEach(([key, value]) => {
//           formData.append(key, value);
//         });

//         await axiosClient.post('api/register/', formData, {
//           headers: {
//             'X-CSRFToken': csrfToken,
//             'Content-Type': 'multipart/form-data',
//           },
//           withCredentials: true,
//         });
//       } else {
//         const formData = new FormData();

//         // Append nested user fields
//         Object.entries(ownerForm.user).forEach(([key, value]) => {
//           formData.append(`user.${key}`, value);
//         });

//         formData.append('futsal_name', ownerForm.futsal_name);
//         formData.append('location', ownerForm.location);

//         // Append each ground's data
//         ownerForm.grounds.forEach((ground, index) => {
//           Object.entries(ground).forEach(([key, value]) => {
//             formData.append(`grounds[${index}].${key}`, value);
//           });
//         });

//         await axiosClient.post('api/register-owner/', formData, {
//           headers: {
//             'X-CSRFToken': csrfToken,
//             'Content-Type': 'multipart/form-data',
//           },
//           withCredentials: true,
//         });
//       }

//       navigate('/login');
//     } catch (error) {
//       console.error('Registration error:', error.response?.data || error);
//     }
//   };

//   return (
//     <div>
//       <h2>{role === 'user' ? 'Register as User' : 'Register as Owner'}</h2>
//       <button onClick={() => setRole(role === 'user' ? 'owner' : 'user')}>
//         Switch to {role === 'user' ? 'Owner' : 'User'}
//       </button>
//       <form onSubmit={handleSubmit} encType="multipart/form-data">
//         {role === 'user' ? (
//           <>
//             {Object.entries(userForm).map(([key, value]) => (
//               key !== 'profile_pic' ? (
//                 <input
//                   key={key}
//                   type={key.toLowerCase().includes('password') ? 'password' : 'text'}
//                   name={key}
//                   placeholder={key}
//                   value={value}
//                   onChange={handleUserChange}
//                   required
//                 />
//               ) : (
//                 <input
//                   key={key}
//                   type="file"
//                   name={key}
//                   accept="image/*"
//                   onChange={handleUserChange}
//                   required
//                 />
//               )
//             ))}
//           </>
//         ) : (
//           <>
//             {Object.entries(ownerForm.user).map(([key, value]) => (
//               key !== 'profile_pic' ? (
//                 <input
//                   key={key}
//                   type={key.toLowerCase().includes('password') ? 'password' : 'text'}
//                   name={key}
//                   placeholder={key}
//                   value={value}
//                   onChange={handleOwnerUserChange}
//                   required
//                 />
//               ) : (
//                 <input
//                   key={key}
//                   type="file"
//                   name={key}
//                   accept="image/*"
//                   onChange={handleOwnerUserChange}
//                   required
//                 />
//               )
//             ))}
//             <input
//               type="text"
//               name="futsal_name"
//               placeholder="Futsal Name"
//               value={ownerForm.futsal_name}
//               onChange={(e) => setOwnerForm(prev => ({ ...prev, futsal_name: e.target.value }))}
//               required
//             />
//             <input
//               type="text"
//               name="location"
//               placeholder="Location"
//               value={ownerForm.location}
//               onChange={(e) => setOwnerForm(prev => ({ ...prev, location: e.target.value }))}
//               required
//             />

//             {ownerForm.grounds.map((ground, idx) => (
//               <div key={idx}>
//                 <select
//                   name="ground_type"
//                   value={ground.ground_type}
//                   onChange={(e) => handleGroundChange(idx, e)}
//                   required
//                 >
//                   <option value="">Select Ground Type</option>
//                   <option value="5A">5-a-side</option>
//                   <option value="7A">7-a-side</option>
//                   <option value="MAT">Mat Futsal</option>
//                   <option value="TURF">Turf</option>
//                   <option value="WOOD">Wooden Floor</option>
//                 </select>
//                 <input
//                   type="time"
//                   name="opening_time"
//                   value={ground.opening_time}
//                   onChange={(e) => handleGroundChange(idx, e)}
//                   required
//                 />
//                 <input
//                   type="time"
//                   name="closing_time"
//                   value={ground.closing_time}
//                   onChange={(e) => handleGroundChange(idx, e)}
//                   required
//                 />
//                 <input
//                   type="number"
//                   name="price"
//                   placeholder="Price"
//                   value={ground.price}
//                   onChange={(e) => handleGroundChange(idx, e)}
//                   required
//                 />
//                 <input
//                   type="file"
//                   name="image"
//                   accept="image/*"
//                   onChange={(e) => handleGroundChange(idx, e)}
//                   required
//                 />
//                 <button type="button" onClick={() => removeGround(idx)}>Remove Ground</button>
//               </div>
//             ))}
//             <button type="button" onClick={addGround}>Add Another Ground</button>
//           </>
//         )}
//         <button type="submit">Register as {role === 'user' ? 'User' : 'Owner'}</button>
//       </form>
//     </div>
//   );
// };

// export default RegisterPage;
