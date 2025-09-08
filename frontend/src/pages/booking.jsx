


// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams } from 'react-router-dom';
// import axiosClient from '../authenticated/axiosCredint';

// export default function BookingForm() {
//   const { ownerId } = useParams();
//   const [grounds, setGrounds] = useState([]);
//   const [selectedSlotInfo, setSelectedSlotInfo] = useState({ groundId: '', slot: '' });
//   const [bookingDate, setBookingDate] = useState('');
//   const [bookedSlotsByGround, setBookedSlotsByGround] = useState({});
//   const [message, setMessage] = useState('');
//   const [showMessage, setShowMessage] = useState(false);

//   const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
//   useEffect(() => setBookingDate(todayStr), [todayStr]);

//   // Fetch grounds for owner
//   useEffect(() => {
//     async function fetchGrounds() {
//       if (!ownerId) return;
//       try {
//         const res = await axiosClient.get(`/api/grounds/owner/${ownerId}/`);
//         setGrounds(res.data.grounds || []);
//       } catch (err) {
//         console.error('Error fetching grounds:', err);
//         showTempMessage('Failed to load grounds', false);
//       }
//     }
//     fetchGrounds();
//   }, [ownerId]);

//   // Fetch booked slots for all grounds
//   useEffect(() => {
//     async function fetchBookedSlots() {
//       const newBooked = {};
//       for (const g of grounds) {
//         try {
//           const res = await axiosClient.get(
//             `/api/booked-slots/?ground=${g.id}&date=${bookingDate}`
//           );
//           newBooked[g.id] = res.data || [];
//         } catch {
//           newBooked[g.id] = [];
//         }
//       }
//       setBookedSlotsByGround(newBooked);
//     }

//     if (grounds.length > 0 && bookingDate) fetchBookedSlots();
//   }, [grounds, bookingDate]);

//   const isTimeSlotPast = slot => {
//     const [startTime] = slot.split('-').map(s => s.trim());
//     return new Date(`${bookingDate}T${startTime}:00`) < new Date();
//   };

//   const getSlotClass = (groundId, slot) => {
//     if (isTimeSlotPast(slot)) return 'slot past';
//     if (bookedSlotsByGround[groundId]?.includes(slot)) return 'slot booked';
//     if (selectedSlotInfo.groundId === groundId && selectedSlotInfo.slot === slot)
//       return 'slot selected animated';
//     return 'slot free';
//   };

//   const showTempMessage = (msg, success = true) => {
//     setMessage(msg);
//     setShowMessage(true);
//     setTimeout(() => setShowMessage(false), 3000);
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     if (!selectedSlotInfo.groundId || !bookingDate || !selectedSlotInfo.slot) {
//       showTempMessage('Please select a slot to book', false);
//       return;
//     }

//     try {
//       await axiosClient.post('/api/bookings/', {
//         ground: selectedSlotInfo.groundId,
//         booking_date: bookingDate,
//         time_slot: selectedSlotInfo.slot,
//       });

//       showTempMessage('Booking successful!');

//       // Refresh booked slots
//       const res = await axiosClient.get(
//         `/api/booked-slots/?ground=${selectedSlotInfo.groundId}&date=${bookingDate}`
//       );
//       setBookedSlotsByGround(prev => ({
//         ...prev,
//         [selectedSlotInfo.groundId]: res.data || [],
//       }));

//       // Reset selection
//       setSelectedSlotInfo({ groundId: '', slot: '' });
//     } catch (err) {
//       const errMsg = err.response?.data
//         ? `Booking failed: ${JSON.stringify(err.response.data)}`
//         : 'Booking failed. Please try again.';
//       showTempMessage(errMsg, false);
//     }
//   };

//   return (
//     <div className="booking-wrapper">
//       <h2>Book Your Ground Slot</h2>

//       {/* Date Selector */}
//       <label>
//         Select Date:
//         <input
//           type="date"
//           value={bookingDate}
//           onChange={e => setBookingDate(e.target.value)}
//           min={todayStr}
//         />
//       </label>

//       <form onSubmit={handleSubmit}>
//         {grounds.map(g => (
//           <div key={g.id} className="ground-section">
//             <h3>{g.ground_type} ({g.name || 'No Name'})</h3>
//             <div className="slots-grid">
//               {g.available_time_slots.map((slot, i) => (
//                 <button
//                   key={i}
//                   type="button"
//                   className={getSlotClass(g.id, slot)}
//                   disabled={isTimeSlotPast(slot) || bookedSlotsByGround[g.id]?.includes(slot)}
//                   onClick={() => setSelectedSlotInfo({ groundId: g.id, slot })}
//                 >
//                   {slot}
//                 </button>
//               ))}
//             </div>
//           </div>
//         ))}

//         <button
//           type="submit"
//           className="submit-btn animated"
//           disabled={!selectedSlotInfo.slot || !bookingDate}
//         >
//           Confirm Booking
//         </button>

//         {showMessage && (
//           <p className={`message ${message.includes('successful') ? 'message-success' : 'message-error'} fade`}>
//             {message}
//           </p>
//         )}
//       </form>
//     </div>
//   );
// }



import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../authenticated/axiosCredint';

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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6 mt-8">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Book Your Ground Slot</h2>

      {/* Date Selector */}
      <label className="block text-lg font-medium text-gray-800 mb-2">
        Select Date:
        <input
          type="date"
          value={bookingDate}
          onChange={e => setBookingDate(e.target.value)}
          min={todayStr}
          className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm text-gray-900 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </label>

      <form onSubmit={handleSubmit} className="space-y-6">
        {grounds.map(g => (
          <div key={g.id} className="border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-2xl font-semibold text-gray-900">
              {g.ground_type} ({g.name || 'No Name'})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {g.available_time_slots.map((slot, i) => (
                <button
                  key={i}
                  type="button"
                  className={`
                    rounded-lg px-4 py-3 text-center text-sm font-medium transition-all
                    ${getSlotClass(g.id, slot) === 'slot.free' ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' : ''}
                    ${getSlotClass(g.id, slot) === 'slot.booked' ? 'bg-gray-200 border-transparent text-gray-400 cursor-not-allowed' : ''}
                    ${getSlotClass(g.id, slot) === 'slot.selected' ? 'bg-amber-500 text-white border border-amber-500 shadow-md ring-2 ring-offset-2 ring-amber-500' : ''}
                    ${getSlotClass(g.id, slot) === 'slot.past' ? 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed' : ''}
                  `}
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
          className="w-full sm:w-auto bg-indigo-500 text-white font-medium px-6 py-3 rounded-md shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
          disabled={!selectedSlotInfo.slot || !bookingDate}
        >
          Confirm Booking
        </button>

        {showMessage && (
          <p
            className={`mt-4 text-center font-medium p-3 rounded-md ${
              message.includes('successful') ? 'text-green-800 bg-green-50' : 'text-red-800 bg-red-50'
            } animate-fade`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
