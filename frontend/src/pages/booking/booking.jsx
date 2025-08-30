


import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../authenticated/axiosCredint';

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
