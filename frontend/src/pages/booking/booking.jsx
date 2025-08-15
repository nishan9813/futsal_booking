// import React, { useState, useEffect, useMemo } from 'react';
// import axiosClient from '../../authenticated/axiosCredint';
// import './Booking.css';

// export default function BookingForm() {
//   const [grounds, setGrounds] = useState([]);
//   const [selectedGroundId, setSelectedGroundId] = useState('');
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [selectedSlot, setSelectedSlot] = useState('');
//   const [bookingDate, setBookingDate] = useState('');
//   const [bookedSlots, setBookedSlots] = useState([]);
//   const [message, setMessage] = useState('');
//   const [showMessage, setShowMessage] = useState(false);

//   const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

//   useEffect(() => {
//     setBookingDate(todayStr);
//   }, [todayStr]);

//   useEffect(() => {
//     async function fetchGrounds() {
//       try {
//         const res = await axiosClient.get('/api/grounds/');
//         if (res.data?.owners) {
//           const allGrounds = res.data.owners.flatMap(owner => owner.grounds || []);
//           setGrounds(allGrounds);
//         } else {
//           setGrounds([]);
//         }
//       } catch (err) {
//         setMessage('Error loading grounds.');
//         setShowMessage(true);
//         autoHideMessage();
//       }
//     }
//     fetchGrounds();
//   }, []);

//   useEffect(() => {
//     async function fetchSlots() {
//       if (!selectedGroundId || !bookingDate) return;

//       try {
//         const res = await axiosClient.get(`/api/booked-slots/?ground=${selectedGroundId}&date=${bookingDate}`);
//         setBookedSlots(res.data || []);
//       } catch (err) {
//         console.error('Error fetching booked slots:', err);
//         setBookedSlots([]);
//       }

//       const ground = grounds.find(g => g.id === parseInt(selectedGroundId, 10));
//       setAvailableSlots(ground?.available_time_slots || []);
//     }
//     fetchSlots();
//   }, [selectedGroundId, bookingDate, grounds]);

//   const autoHideMessage = () => {
//     setTimeout(() => setShowMessage(false), 3000);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedGroundId || !bookingDate || !selectedSlot) {
//       setMessage('Please select ground, date, and time slot.');
//       setShowMessage(true);
//       autoHideMessage();
//       return;
//     }
//     try {
//       const payload = {
//         ground: selectedGroundId,
//         booking_date: bookingDate,
//         time_slot: selectedSlot,
//       };

//       await axiosClient.post('/api/bookings/', payload);

//       setMessage('Booking successful!');
//       setShowMessage(true);
//       setSelectedSlot('');

//       const res = await axiosClient.get(`/api/booked-slots/?ground=${selectedGroundId}&date=${bookingDate}`);
//       setBookedSlots(res.data || []);
//       autoHideMessage();
//     } catch (err) {
//       const errMsg = err.response?.data
//         ? `Booking failed: ${JSON.stringify(err.response.data)}`
//         : 'Booking failed. Please try again.';
//       setMessage(errMsg);
//       setShowMessage(true);
//       autoHideMessage();
//     }
//   };

//   const isTimeSlotPast = (slot) => {
//     if (!bookingDate) return false;
//     const [startTime] = slot.split('-').map(s => s.trim());
//     const slotDateTime = new Date(`${bookingDate}T${startTime}:00`);
//     return slotDateTime < new Date();
//   };

//   const getSlotClass = (slot) => {
//     if (isTimeSlotPast(slot)) return 'slot past';
//     if (bookedSlots.includes(slot)) return 'slot booked';
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
//               <option key={g.id} value={g.id}>
//                 {g.ground_type} ({g.name || 'No Name'})
//               </option>
//             ))}
//           </select>
//         </label>

//         <label>
//           Select Date:
//           <input
//             type="date"
//             value={bookingDate}
//             onChange={e => setBookingDate(e.target.value)}
//             min={todayStr}
//             required
//           />
//         </label>

//         <div className="slots-grid">
//           {availableSlots.length === 0 && <p>No available slots for selected ground.</p>}
//           {availableSlots.map((slot, i) => (
//             <button
//               key={i}
//               type="button"
//               className={getSlotClass(slot)}
//               onClick={() => {
//                 if (!isTimeSlotPast(slot) && !bookedSlots.includes(slot)) {
//                   setSelectedSlot(slot);
//                 }
//               }}
//               disabled={isTimeSlotPast(slot) || bookedSlots.includes(slot)}
//             >
//               {slot}
//             </button>
//           ))}
//         </div>

//         <button
//           type="submit"
//           className="submit-btn"
//           disabled={!selectedSlot || !selectedGroundId || !bookingDate}
//         >
//           Confirm Booking
//         </button>

//         {showMessage && (
//           <p className={`message ${message.includes('successful') ? 'message-success' : 'message-error'}`}>
//             {message}
//           </p>
//         )}
//       </form>
//     </div>
//   );
// }



import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../authenticated/axiosCredint';
import './Booking.css';

export default function BookingForm() {
  const { ownerId } = useParams();
  const [grounds, setGrounds] = useState([]);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState({ groundId: '', slot: '' });
  const [bookingDate, setBookingDate] = useState('');
  const [bookedSlotsByGround, setBookedSlotsByGround] = useState({});
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  useEffect(() => setBookingDate(todayStr), [todayStr]);

  // Fetch grounds for owner
  useEffect(() => {
    async function fetchGrounds() {
      if (!ownerId) return;
      try {
        const res = await axiosClient.get(`/api/grounds/owner/${ownerId}/`);
        setGrounds(res.data.grounds || []);
      } catch (err) {
        console.error('Error fetching grounds:', err);
        showTempMessage('Failed to load grounds', false);
      }
    }
    fetchGrounds();
  }, [ownerId]);

  // Fetch booked slots for all grounds
  useEffect(() => {
    async function fetchBookedSlots() {
      const newBooked = {};
      for (const g of grounds) {
        try {
          const res = await axiosClient.get(
            `/api/booked-slots/?ground=${g.id}&date=${bookingDate}`
          );
          newBooked[g.id] = res.data || [];
        } catch {
          newBooked[g.id] = [];
        }
      }
      setBookedSlotsByGround(newBooked);
    }

    if (grounds.length > 0 && bookingDate) fetchBookedSlots();
  }, [grounds, bookingDate]);

  const isTimeSlotPast = slot => {
    const [startTime] = slot.split('-').map(s => s.trim());
    return new Date(`${bookingDate}T${startTime}:00`) < new Date();
  };

  const getSlotClass = (groundId, slot) => {
    if (isTimeSlotPast(slot)) return 'slot past';
    if (bookedSlotsByGround[groundId]?.includes(slot)) return 'slot booked';
    if (selectedSlotInfo.groundId === groundId && selectedSlotInfo.slot === slot)
      return 'slot selected animated';
    return 'slot free';
  };

  const showTempMessage = (msg, success = true) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedSlotInfo.groundId || !bookingDate || !selectedSlotInfo.slot) {
      showTempMessage('Please select a slot to book', false);
      return;
    }

    try {
      await axiosClient.post('/api/bookings/', {
        ground: selectedSlotInfo.groundId,
        booking_date: bookingDate,
        time_slot: selectedSlotInfo.slot,
      });

      showTempMessage('Booking successful!');

      // Refresh booked slots
      const res = await axiosClient.get(
        `/api/booked-slots/?ground=${selectedSlotInfo.groundId}&date=${bookingDate}`
      );
      setBookedSlotsByGround(prev => ({
        ...prev,
        [selectedSlotInfo.groundId]: res.data || [],
      }));

      // Reset selection
      setSelectedSlotInfo({ groundId: '', slot: '' });
    } catch (err) {
      const errMsg = err.response?.data
        ? `Booking failed: ${JSON.stringify(err.response.data)}`
        : 'Booking failed. Please try again.';
      showTempMessage(errMsg, false);
    }
  };

  return (
    <div className="booking-wrapper">
      <h2>Book Your Ground Slot</h2>

      {/* Date Selector */}
      <label>
        Select Date:
        <input
          type="date"
          value={bookingDate}
          onChange={e => setBookingDate(e.target.value)}
          min={todayStr}
        />
      </label>

      <form onSubmit={handleSubmit}>
        {grounds.map(g => (
          <div key={g.id} className="ground-section">
            <h3>{g.ground_type} ({g.name || 'No Name'})</h3>
            <div className="slots-grid">
              {g.available_time_slots.map((slot, i) => (
                <button
                  key={i}
                  type="button"
                  className={getSlotClass(g.id, slot)}
                  disabled={isTimeSlotPast(slot) || bookedSlotsByGround[g.id]?.includes(slot)}
                  onClick={() => setSelectedSlotInfo({ groundId: g.id, slot })}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="submit-btn animated"
          disabled={!selectedSlotInfo.slot || !bookingDate}
        >
          Confirm Booking
        </button>

        {showMessage && (
          <p className={`message ${message.includes('successful') ? 'message-success' : 'message-error'} fade`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
