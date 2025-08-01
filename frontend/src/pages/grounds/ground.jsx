import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Grounds.css";

const Grounds = () => {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/grounds/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        const allGrounds = [];
        response.data.owners.forEach((owner) => {
          owner.grounds.forEach((ground) => {
            allGrounds.push({
              ...ground,
              futsal_name: owner.futsal_name,
              location: owner.location,
              owner_username: owner.username,
            });
          });
        });
        setGrounds(allGrounds);
      })
      .catch((error) => {
        console.error("Error fetching grounds:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="grounds-container">
      {grounds.length === 0 ? (
        <p>No grounds found.</p>
      ) : (
        grounds.map((ground, idx) => (
          <div key={idx} className="ground-card">
            <h3 className="ground-name">{ground.futsal_name}</h3>

            <img
              src={ground.images?.[0] || "/placeholder.jpg"}
              alt="Ground"
              className="ground-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder.jpg";
              }}
            />

            <div className="ground-details">
              <p>
                <strong>Location:</strong> {ground.location}
              </p>
              <p>
                <strong>Type:</strong> {ground.ground_type}
              </p>
              <p>
                <strong>Price:</strong> Rs. {ground.price}
              </p>
              <Link
                to={`/book/${ground.id}`}
                className="nav-link"
              >
                Book
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Grounds;
