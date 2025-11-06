import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../authenticated/axiosCredint";
import SlotButton from "./SlotButton";

export default function Cards({ ownerId, bookingDate, selectedSlotInfo, setSelectedSlotInfo, selectedPrice, setSelectedPrice }) {
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [bookedSlotsByGround, setBookedSlotsByGround] = useState({});
  const [slotPrices, setSlotPrices] = useState({}); // Store prices for each slot

  // Fetch grounds
  useEffect(() => {
    if (!ownerId) return;
    (async () => {
      try {
        const res = await axiosClient.get(`/api/grounds/owner/${ownerId}/`);
        setGrounds(res.data.grounds || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [ownerId]);

  // Fetch booked slots and prices
  useEffect(() => {
    if (!grounds.length || !bookingDate) return;
    
    const fetchSlotData = async () => {
      const newBooked = {};
      const newPrices = {};
      
      for (const g of grounds) {
        try {
          // Fetch booked slots
          const bookedRes = await axiosClient.get(`/api/booked-slots/?ground=${g.id}&date=${bookingDate}`);
          newBooked[g.id] = bookedRes.data || [];
          
          // Fetch prices for each slot
          newPrices[g.id] = {};
          for (const slot of g.available_time_slots || []) {
            try {
              const [startTime] = slot.split("-").map(s => s.trim());
              const slotDateTime = `${bookingDate}T${startTime}:00`;
              
              const priceRes = await axiosClient.get(`/api/ground-price/?ground_id=${g.id}&datetime=${slotDateTime}`);
              newPrices[g.id][slot] = priceRes.data.final_price || 500;
            } catch (priceErr) {
              console.error(`Error fetching price for slot ${slot}:`, priceErr);
              newPrices[g.id][slot] = 500; // Default price
            }
          }
        } catch {
          newBooked[g.id] = [];
        }
      }
      
      setBookedSlotsByGround(newBooked);
      setSlotPrices(newPrices);
    };

    fetchSlotData();
  }, [grounds, bookingDate]);

  const handleSlotClick = async (groundId, slot) => {
    const slotClass = getSlotClass(groundId, slot);
    if (slotClass === "free") {
      const actualPrice = slotPrices[groundId]?.[slot] || 500;
      setSelectedSlotInfo({ 
        groundId, 
        slot, 
        actualPrice 
      });
      setSelectedPrice(500); // Always set booking price to 500
    }
  };

  const getSlotClass = (groundId, slot) => {
    const now = new Date();
    const slotStart = new Date(`${bookingDate}T${slot.split("-")[0].trim()}:00`);
    if (slotStart < now) return "past";
    if (bookedSlotsByGround[groundId]?.includes(slot)) return "booked";
    if (selectedSlotInfo.groundId === groundId && selectedSlotInfo.slot === slot) return "selected";
    return "free";
  };

  const getSlotPrice = (groundId, slot) => {
    return slotPrices[groundId]?.[slot] || 500;
  };

  return (
    <div className="space-y-6">
      {grounds.map((ground) => (
        <div key={ground.id} className="border border-gray-200 rounded-2xl p-6 shadow-lg space-y-4 bg-white hover:shadow-xl transition-shadow duration-200">
          <h3 className="text-2xl font-bold text-gray-800">{ground.ground_type} - {ground.name || ground.address}</h3>

          {/* Images */}
          {ground.images?.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto py-2">
              {ground.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.startsWith("http") ? img : axiosClient.defaults.baseURL + img}
                  alt={`Ground ${idx + 1}`}
                  className="w-32 h-20 object-cover rounded-md shadow-sm flex-shrink-0"
                />
              ))}
            </div>
          )}

          {/* Pricing Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 font-semibold">
              Dynamic Pricing - Pay only <span className="text-green-600">Rs 500</span> to book
            </p>
          </div>

          {/* Time slots */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ground.available_time_slots?.map((slot, idx) => (
              <div key={idx} className="relative">
                <SlotButton
                  slot={slot}
                  slotClass={getSlotClass(ground.id, slot)}
                  onClick={() => handleSlotClick(ground.id, slot)}
                />
                {/* Display dynamic price for each slot */}
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  Rs {getSlotPrice(ground.id, slot)}
                </div>
              </div>
            ))}
          </div>

          {/* Selected slot info */}
          {selectedSlotInfo.groundId === ground.id && selectedSlotInfo.slot && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <p className="text-indigo-700 font-semibold">
                Selected: {selectedSlotInfo.slot} 
                <span className="text-gray-600 ml-2">(Dynamic Price: Rs {selectedSlotInfo.actualPrice})</span>
              </p>
              <p className="text-green-600 font-bold mt-1">
                You'll pay only: Rs 500 booking fee
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}