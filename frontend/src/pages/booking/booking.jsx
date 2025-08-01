import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Booking.css';

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      const cookie = c.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const BookingForm = () => {
  const { id: groundId } = useParams();
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [groundName, setGroundName] = useState('');
  const [futsalName, setFutsalName] = useState('');
  const [formData, setFormData] = useState({
    booking_date: '',
    time_slot: '',
  });

  // Fetch ground info including futsal name and available time slots
  useEffect(() => {
    axios.get('/api/grounds/')
      .then(response => {
        const owners = response.data.owners || [];
        const allGrounds = owners.flatMap(owner => owner.grounds);
        const ground = allGrounds.find(g => String(g.id) === groundId);

        if (ground) {
          setGroundName(ground.ground_type || 'Ground');
          setTimeSlots(ground.available_time_slots || []);
          setFutsalName(ground.futsal_name || ''); // Get futsal name from ground data
        } else {
          setGroundName('Ground not found');
          setTimeSlots([]);
          setFutsalName('');
        }
      })
      .catch(error => {
        console.error('Error fetching ground details:', error);
        setGroundName('Error loading ground');
        setTimeSlots([]);
        setFutsalName('');
      });
  }, [groundId]);

  // Fetch booked slots for selected date and ground
  useEffect(() => {
    if (!groundId || !formData.booking_date) return;

    axios.get('/api/booking/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
    })
      .then(response => {
        const filtered = response.data.filter(b =>
          String(b.ground) === String(groundId) &&
          b.booking_date === formData.booking_date
        );
        const booked = filtered.map(b => b.time_slot);
        setBookedSlots(booked);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setBookedSlots([]);
      });
  }, [groundId, formData.booking_date]);

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSlotClick = slot => {
    if (!bookedSlots.includes(slot)) {
      setFormData(prev => ({ ...prev, time_slot: slot }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const csrftoken = getCookie('csrftoken');

    axios.post('/api/booking/', {
      ...formData,
      ground: groundId,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'X-CSRFToken': csrftoken,
      },
      withCredentials: true,
    })
      .then(() => {
        alert('Booking successful!');
        setFormData({ booking_date: '', time_slot: '' });
        setBookedSlots([]);
      })
      .catch(error => {
        alert('Booking failed.');
        console.error(error.response?.data || error);
      });
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      {/* Display futsal name and ground name */}
      <h1 className="futsal-title">{futsalName}</h1>
      <h2>Book "{groundName}"</h2>

      <label htmlFor="booking_date">Booking Date:</label>
      <input
        type="date"
        id="booking_date"
        name="booking_date"
        value={formData.booking_date}
        onChange={handleChange}
        required
        min={new Date().toISOString().split('T')[0]}
      />

      {formData.booking_date && (
        <>
          <label>Select Time Slot:</label>
          <div className="slot-grid">
            {timeSlots.map(slot => {
              const isBooked = bookedSlots.includes(slot);
              const isSelected = formData.time_slot === slot;
              return (
                <div
                  key={slot}
                  className={`slot ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
                  onClick={() => handleSlotClick(slot)}
                >
                  {slot}
                </div>
              );
            })}
          </div>

          <div className="legend">
            <span className="legend-box available"></span> Available
            <span className="legend-box booked"></span> Booked
            <span className="legend-box selected"></span> Selected
          </div>
        </>
      )}

      <button type="submit" disabled={!formData.booking_date || !formData.time_slot}>
        Book
      </button>
    </form>
  );
};

export default BookingForm;
