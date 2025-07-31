import React from 'react';

import { useEffect, useState } from "react";
import axios from "axios";
import "./Grounds.css"; // optional for styles

const Grounds = () => {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/grounds/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // adjust token storage
      }
    })
      .then(response => {
        const allGrounds = [];
        response.data.owners.forEach(owner => {
          owner.grounds.forEach(ground => {
            allGrounds.push({
              ...ground,
              futsal_name: owner.futsal_name,
              location: owner.location,
              owner_username: owner.username,
            });
          });
        });
        setGrounds(allGrounds);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching grounds:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="grounds-container">
      {grounds.map((ground, idx) => (
        <div key={idx} className="ground-card">
          <img
            src={ground.images[0]}
            alt="Ground"
            className="ground-img"
          />
          <div className="ground-info">
            <h3>{ground.futsal_name}</h3>
            <p><strong>Type:</strong> {ground.ground_type}</p>
            <p><strong>Location:</strong> {ground.location}</p>
            <p><strong>Open:</strong> {ground.opening_time} - {ground.closing_time}</p>
            <p><strong>Price:</strong> Rs. {ground.price}</p>
            <p><strong>Slots:</strong> {ground.available_time_slots.join(", ")}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Grounds;
