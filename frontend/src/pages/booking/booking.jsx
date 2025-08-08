// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './Booking.css'; // Assume styles are in this file

// function getCookie(name) {
//   let cookieValue = null;
//   if (document.cookie && document.cookie !== '') {
//     const cookies = document.cookie.split(';');
//     for (let cookie of cookies) {
//       cookie = cookie.trim();
//       if (cookie.startsWith(name + '=')) {
//         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//         break;
//       }
//     }
//   }
//   return cookieValue;
// }

// export default function BookingForm() {
//   const [grounds, setGrounds] = useState([]);
//   const [selectedGroundId, setSelectedGroundId] = useState('');
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [selectedSlot, setSelectedSlot] = useState('');
//   const [bookingDate, setBookingDate] = useState('');
//   const [bookedSlots, setBookedSlots] = useState([]);
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     const today = new Date().toISOString().split('T')[0];
//     setBookingDate(today);
//   }, []);

//   useEffect(() => {
//     const fetchGrounds = async () => {
//       try {
//         const res = await axios.get('/api/grounds/');
//         if (res.data && res.data.owners) {
//           const allGrounds = res.data.owners.flatMap(owner => owner.grounds || []);
//           setGrounds(allGrounds);
//         } else {
//           setGrounds([]);
//         }
//       } catch (error) {
//         console.error('Failed to fetch grounds:', error);
//         setMessage('Failed to load grounds.');
//       }
//     };

//     fetchGrounds();
//   }, []);

//   useEffect(() => {
//     const fetchSlots = async () => {
//       if (!selectedGroundId || !bookingDate) return;
//       try {
//         const res = await axios.get(`/api/bookings/?ground=${selectedGroundId}&booking_date=${bookingDate}`);
//         setBookedSlots(res.data.booked_slots || []);
//       } catch (error) {
//         console.error('Failed to fetch booked slots:', error);
//         setBookedSlots([]);
//       }
//     };

//     const ground = grounds.find(g => g.id === Number(selectedGroundId));
//     if (ground) {
//       setAvailableSlots(ground.available_time_slots || []);
//     }

//     fetchSlots();
//   }, [selectedGroundId, bookingDate, grounds]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedGroundId || !bookingDate || !selectedSlot) {
//       setMessage('Please select ground, date, and time slot.');
//       return;
//     }

//     try {
//       const csrftoken = getCookie('csrftoken');
//       const payload = {
//         ground: selectedGroundId,
//         booking_date: bookingDate,
//         time_slot: selectedSlot,
//       };

//       await axios.post('/api/bookings/', payload, {
//         headers: {
//           'X-CSRFToken': csrftoken,
//           'Content-Type': 'application/json',
//         },
//       });

//       setMessage('Booking successful!');
//       setSelectedSlot('');
//     } catch (error) {
//       console.error('Booking failed:', error);
//       if (error.response && error.response.data) {
//         setMessage('Booking failed: ' + JSON.stringify(error.response.data));
//       } else {
//         setMessage('Booking failed. Please try again.');
//       }
//     }
//   };

//   const isTimeSlotPast = (slot) => {
//     if (!bookingDate) return false;
//     const [startTime] = slot.split(' - ');
//     const slotDateTime = new Date(`${bookingDate}T${startTime}:00`);
//     const now = new Date();
//     return slotDateTime < now;
//   };

//   const isBooked = (slot) => bookedSlots.includes(slot);

//   const getSlotClass = (slot) => {
//     if (isTimeSlotPast(slot)) return 'slot past';
//     if (isBooked(slot)) return 'slot booked';
//     if (selectedSlot === slot) return 'slot selected';
//     return 'slot free';
//   };

//   return (
//     <div className="booking-wrapper">
//       <h2>Book Your Ground Slot</h2>
//       <form onSubmit={handleSubmit}>
//         <label>
//           Select Ground:
//           <select value={selectedGroundId} onChange={e => setSelectedGroundId(e.target.value)} required>
//             <option value="">-- Choose Ground --</option>
//             {grounds.map(g => (
//               <option key={g.id} value={g.id}>{g.ground_type}</option>
//             ))}
//           </select>
//         </label>

//         <label>
//           Select Date:
//           <input
//             type="date"
//             value={bookingDate}
//             onChange={e => setBookingDate(e.target.value)}
//             min={new Date().toISOString().split('T')[0]}
//             required
//           />
//         </label>

//         <div className="slots-grid">
//           {availableSlots.map((slot, idx) => (
//             <button
//               type="button"
//               key={idx}
//               className={getSlotClass(slot)}
//               onClick={() => !isTimeSlotPast(slot) && !isBooked(slot) && setSelectedSlot(slot)}
//               disabled={isTimeSlotPast(slot) || isBooked(slot)}
//             >
//               {slot}
//             </button>
//           ))}
//         </div>

//         <button type="submit" disabled={!selectedSlot} className="submit-btn">
//           Confirm Booking
//         </button>

//         {message && <p className="message">{message}</p>}
//       </form>
//     </div>
//   );
// }














import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Booking.css'; // Import your CSS file

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function BookingForm() {
  const [grounds, setGrounds] = useState([]);
  const [selectedGroundId, setSelectedGroundId] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // Set today's date by default
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setBookingDate(today);
  }, []);

  // Fetch grounds
  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const res = await axios.get('/api/grounds/');
        if (res.data?.owners) {
          const allGrounds = res.data.owners.flatMap(owner => owner.grounds || []);
          setGrounds(allGrounds);
        } else {
          setGrounds([]);
        }
      } catch (err) {
        setMessage('Error loading grounds.');
        setShowMessage(true);
        autoHideMessage();
      }
    };
    fetchGrounds();
  }, []);

  // Fetch slots when ground or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedGroundId || !bookingDate) return;

      try {
        const res = await axios.get(`/api/booked-slots/?ground=${selectedGroundId}&date=${bookingDate}`);
        setBookedSlots(res.data || []);
      } catch (err) {
        console.error('Error fetching booked slots:', err);
        setBookedSlots([]);
      }

      const ground = grounds.find(g => g.id === parseInt(selectedGroundId));
      setAvailableSlots(ground?.available_time_slots || []);
    };

    fetchSlots();
  }, [selectedGroundId, bookingDate, grounds]);

  const autoHideMessage = () => {
    setTimeout(() => setShowMessage(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGroundId || !bookingDate || !selectedSlot) {
      setMessage('Please select ground, date, and time slot.');
      setShowMessage(true);
      autoHideMessage();
      return;
    }

    try {
      const csrftoken = getCookie('csrftoken');
      const payload = {
        ground: selectedGroundId,
        booking_date: bookingDate,
        time_slot: selectedSlot,
      };

      await axios.post('/api/bookings/', payload, {
        headers: {
          'X-CSRFToken': csrftoken,
          'Content-Type': 'application/json',
        },
      });

      setMessage('Booking successful!');
      setShowMessage(true);
      setSelectedSlot('');

      const res = await axios.get(`/api/booked-slots/?ground=${selectedGroundId}&date=${bookingDate}`);
      setBookedSlots(res.data || []);
      autoHideMessage();
    } catch (err) {
      const errMsg = err.response?.data
        ? `Booking failed: ${JSON.stringify(err.response.data)}`
        : 'Booking failed. Please try again.';
      setMessage(errMsg);
      setShowMessage(true);
      autoHideMessage();
    }
  };

  const isTimeSlotPast = (slot) => {
    if (!bookingDate) return false;
    const [startTime] = slot.split('-').map(s => s.trim());
    const slotDateTime = new Date(`${bookingDate}T${startTime}:00`);
    return slotDateTime < new Date();
  };

  const getSlotClass = (slot) => {
    if (isTimeSlotPast(slot)) return 'slot past';
    if (bookedSlots.includes(slot)) return 'slot booked';
    if (selectedSlot === slot) return 'slot selected';
    return 'slot free';
  };

  return (
    <div className="booking-wrapper">
      <h2>Book Your Ground Slot</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Select Ground:
          <select value={selectedGroundId} onChange={e => setSelectedGroundId(e.target.value)} required>
            <option value="">-- Choose Ground --</option>
            {grounds.map(g => (
              <option key={g.id} value={g.id}>{g.ground_type}</option>
            ))}
          </select>
        </label>

        <label>
          Select Date:
          <input
            type="date"
            value={bookingDate}
            onChange={e => setBookingDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </label>

        <div className="slots-grid">
          {availableSlots.map((slot, i) => (
            <button
              key={i}
              type="button"
              className={getSlotClass(slot)}
              onClick={() => {
                if (!isTimeSlotPast(slot) && !bookedSlots.includes(slot)) {
                  setSelectedSlot(slot);
                }
              }}
              disabled={isTimeSlotPast(slot) || bookedSlots.includes(slot)}
            >
              {slot}
            </button>
          ))}
        </div>

        <button type="submit" className="submit-btn" disabled={!selectedSlot}>
          Confirm Booking
        </button>

        {showMessage && (
          <p className={`message ${message.includes('successful') ? 'message-success' : 'message-error'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
