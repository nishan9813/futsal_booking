export default function SlotButton({ slot, slotClass, onClick, loading }) {
  const styleMap = {
    free: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200",
    booked: "bg-red-100 border border-red-300 text-red-700 cursor-not-allowed opacity-70",
    pending: "bg-yellow-100 border border-yellow-300 text-yellow-700 cursor-not-allowed",
    selected: "bg-indigo-600 border border-indigo-600 text-white shadow-lg transform -translate-y-0.5 ring-2 ring-indigo-300",
    past: "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
  };

  return (
    <button
      type="button"
      className={`
        rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all duration-200
        ${styleMap[slotClass]} 
        ${loading ? "opacity-60 cursor-wait" : ""}
      `}
      disabled={slotClass === "booked" || slotClass === "past" || slotClass === "pending" || loading}
      onClick={onClick}
    >
      {slot}
    </button>
  );
}