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
  ground_images:[]
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
  function handleGroundImageChange(e, index) {
    const file = e.target.files[0];
    const updatedGrounds = [...ownerForm.grounds];
    updatedGrounds[index].ground_image = file;
    setOwnerForm({ ...ownerForm, grounds: updatedGrounds });
  }

  useEffect(() => {
    // Fetch CSRF token once on mount
    axios.get('/api/csrf/', { withCredentials: true }).catch(console.error);
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






//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   setMessage('');

//   const csrfToken = getCsrfToken();
//   if (!csrfToken) {
//     setMessage('❌ CSRF token missing. Please refresh the page.');
//     return;
//   }

//   if (role === 'user') {
//     if (!validatePasswords(userForm.password, userForm.confirm_password)) {
//       setMessage('❌ Password and Confirm Password do not match');
//       return;
//     }

//     try {
//       await axios.post('api/register/', userForm, {
//         headers: { 'X-CSRFToken': csrfToken },
//         withCredentials: true,
//       });

//       await axios.post('/api/login/', {
//         username: userForm.username,
//         password: userForm.password,
//       }, {
//         headers: { 'X-CSRFToken': csrfToken },
//         withCredentials: true,
//       });

//       setMessage('✅ Registration and login successful! Redirecting...');
//       setTimeout(() => navigate('/'), 1500);
//     } catch (err) {
//       const errMsg =
//         err.response?.data?.detail ||
//         err.response?.data ||
//         err.message ||
//         'Something went wrong';
//       setMessage('❌ ' + JSON.stringify(errMsg));
//     }

//   } else if (role === 'owner') {
//     if (!validatePasswords(ownerForm.user.password, ownerForm.user.confirm_password)) {
//       setMessage('❌ Password and Confirm Password do not match');
//       return;
//     }

//     try {
//       const formData = new FormData();

//       // Add top-level owner fields
//       formData.append('futsal_name', ownerForm.futsal_name);
//       formData.append('location', ownerForm.location);

//       // Add nested user fields
//       Object.entries(ownerForm.user).forEach(([key, value]) => {
//         if (key !== 'confirm_password') {
//           formData.append(`user.${key}`, value);
//         }
//       });

//       // Add grounds
//       ownerForm.grounds.forEach((ground, index) => {
//         formData.append(`grounds[${index}].ground_type`, ground.ground_type);
//         formData.append(`grounds[${index}].opening_time`, ground.opening_time);
//         formData.append(`grounds[${index}].closing_time`, ground.closing_time);
//         formData.append(`grounds[${index}].price`, ground.price);

//         if (ground.ground_images?.length) {
//           ground.ground_images.forEach((file) => {
//             formData.append(`grounds[${index}].ground_images`, file);
//           });
//         }
//       });

//       await axios.post('api/register-owner/', formData, {
//         headers: {
//           'X-CSRFToken': csrfToken,
//           'Content-Type': 'multipart/form-data'
//         },
//         withCredentials: true,
//       });

//       // Auto-login
//       await axios.post('/api/login/', {
//         username: ownerForm.user.username,
//         password: ownerForm.user.password,
//       }, {
//         headers: { 'X-CSRFToken': csrfToken },
//         withCredentials: true,
//       });

//       setMessage('✅ Owner registered and logged in! Redirecting...');
//       setTimeout(() => navigate('/'), 1500);
//     } catch (err) {
//       const errMsg =
//         err.response?.data?.detail ||
//         err.response?.data ||
//         err.message ||
//         'Something went wrong';
//       setMessage('❌ ' + JSON.stringify(errMsg));
//     }
//   }
// };


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
             <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const updatedGrounds = [...ownerForm.grounds];
                    updatedGrounds[idx].ground_images = files;  // Use ground_images plural, store array
                    setOwnerForm({ ...ownerForm, grounds: updatedGrounds });
                  }}
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
