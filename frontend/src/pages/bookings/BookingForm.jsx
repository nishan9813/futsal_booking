import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cards from "./Cards";
import axiosClient from "../../authenticated/axiosCredint";
import PaymentModal from "./payment";

export default function BookingForm() {
  const { ownerId } = useParams();
  const navigate = useNavigate();

  const [bookingDate, setBookingDate] = useState("");
  const [selectedSlotInfo, setSelectedSlotInfo] = useState({ groundId: "", slot: "", actualPrice: 0 });
  const [selectedPrice, setSelectedPrice] = useState(500); // Fixed booking price of 500
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    setBookingDate(todayStr);
  }, [todayStr]);

  const showTempMessage = (msg, success = true) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  const handleProceedToPayment = () => {
    if (!selectedSlotInfo.groundId || !selectedSlotInfo.slot || !bookingDate) {
      showTempMessage("Please select a slot to book", false);
      return;
    }
    setShowPaymentModal(true);
  };

  const handleBookingWithPayment = async (paymentData) => {
    setIsProcessing(true);
    
    try {
      const bookingData = {
        ground: parseInt(selectedSlotInfo.groundId),
        booking_date: bookingDate,
        time_slot: selectedSlotInfo.slot,
        payment: {
          username: paymentData.username,
          pin: paymentData.pin.toString(),
          amount: 500 // Always charge Rs 500 for booking
        }
      };

      console.log("Sending booking data:", bookingData);

      const res = await axiosClient.post("/api/bookings/", bookingData);

      showTempMessage("Booking confirmed! Payment successful.", true);
      setShowPaymentModal(false);
      setSelectedSlotInfo({ groundId: "", slot: "", actualPrice: 0 });
      
      setTimeout(() => {
        navigate("/my-bookings");
      }, 2000);

    } catch (err) {
      console.error("Full error response:", err.response?.data);
      
      let errorMessage = "Booking failed. Please try again.";
      
      if (err.response?.data) {
        const errorData = err.response.data;
        console.log("Error data structure:", errorData);
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.payment) {
          errorMessage = Array.isArray(errorData.payment) ? errorData.payment[0] : errorData.payment;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
        } else {
          for (let key in errorData) {
            if (errorData[key] && Array.isArray(errorData[key]) && errorData[key][0]) {
              errorMessage = errorData[key][0];
              break;
            } else if (errorData[key]) {
              errorMessage = errorData[key];
              break;
            }
          }
        }
      }
      
      showTempMessage(errorMessage, false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-6 mt-8 relative">
      <h2 className="text-3xl font-bold text-center text-gray-800">Book Your Ground Slot</h2>

      {/* Pricing Information Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-800 text-lg">Pricing Information</h3>
            <p className="text-blue-600 text-sm">
              Displayed prices are dynamic based on demand. You'll only pay <strong>Rs 500</strong> to confirm your booking.
            </p>
          </div>
          <div className="bg-green-100 border border-green-300 rounded-lg px-3 py-2">
            <p className="text-green-800 font-bold">Booking Fee: Rs 500</p>
          </div>
        </div>
      </div>

      {/* Date picker */}
      <div className="space-y-2">
        <label className="block text-lg font-medium text-gray-700">
          Select Date:
        </label>
        <input
          type="date"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          min={todayStr}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Cards for each ground */}
      <Cards
        ownerId={ownerId}
        bookingDate={bookingDate}
        selectedSlotInfo={selectedSlotInfo}
        setSelectedSlotInfo={setSelectedSlotInfo}
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
      />

      {/* Selected Slot Summary */}
      {selectedSlotInfo.slot && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-blue-800 text-lg">Selected Slot Summary</h3>
          <div className="text-blue-600 mt-2 space-y-1">
            <p className="flex items-center">
              <span className="font-medium">Date:</span>
              <span className="ml-2">{bookingDate}</span>
            </p>
            <p className="flex items-center">
              <span className="font-medium">Time Slot:</span>
              <span className="ml-2">{selectedSlotInfo.slot}</span>
            </p>
            <p className="flex items-center">
              <span className="font-medium">Dynamic Price:</span>
              <span className="ml-2">Rs {selectedSlotInfo.actualPrice}</span>
            </p>
            <p className="flex items-center">
              <span className="font-medium">Booking Fee:</span>
              <span className="ml-2 text-green-600 font-semibold">Rs 500</span>
            </p>
          </div>
        </div>
      )}

      {/* Proceed to Payment button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleProceedToPayment}
          disabled={!selectedSlotInfo.slot || !bookingDate}
          className={`
            w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200
            ${!selectedSlotInfo.slot || !bookingDate
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5"
            }
          `}
        >
          Proceed to Payment - Rs 500
        </button>
      </div>

      {/* Temporary message */}
      {showMessage && (
        <div className={`
          fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4
          p-4 rounded-xl shadow-lg border transition-all duration-300
          ${message.includes("failed") 
            ? "bg-red-50 border-red-200 text-red-800" 
            : "bg-green-50 border-green-200 text-green-800"
          }
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {message.includes("failed") ? (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          selectedSlotInfo={selectedSlotInfo}
          bookingDate={bookingDate}
          price={500} // Always show Rs 500 in payment modal
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleBookingWithPayment}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}