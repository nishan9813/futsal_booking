// src/components/booking/GroundSection.jsx
import SlotButton from "./SlotButton";

export default function GroundSection({
  ground,
  bookingDate,
  bookedSlots,
  selectedSlotInfo,
  onSlotClick,
}) {
  const isTimeSlotPast = (slot) => {
    const [startTime] = slot.split("-").map((s) => s.trim());
    return new Date(`${bookingDate}T${startTime}:00`) < new Date();
  };

  const getSlotClass = (slot) => {
    if (isTimeSlotPast(slot)) return "past";
    if (bookedSlots.includes(slot)) return "booked";
    if (selectedSlotInfo.groundId === ground.id && selectedSlotInfo.slot === slot)
      return "selected";
    return "free";
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
      {/* Ground Info */}
      <h3 className="text-2xl font-semibold text-gray-900">
        {ground.ground_type} ({ground.name || ground.address || "Unnamed Ground"})
      </h3>

      {/* Ground Images */}
      {ground.ground_images && ground.ground_images.length > 0 && (
        <div className="flex space-x-2 overflow-x-auto py-2">
          {ground.ground_images.map((img, idx) => (
            <img
              key={idx}
              src={img.image || img} // handle both object from API or URL
              alt={`Ground ${idx + 1}`}
              className="w-32 h-20 object-cover rounded-md shadow-sm flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* Time Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ground.available_time_slots.map((slot, i) => (
          <SlotButton
            key={i}
            slot={slot}
            slotClass={getSlotClass(slot)}
            onClick={() => onSlotClick(ground.id, slot)}
          />
        ))}
      </div>
    </div>
  );
}
