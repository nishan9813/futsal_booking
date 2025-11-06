import React, { useState } from "react";

export default function PaymentModal({ 
  selectedSlotInfo, 
  bookingDate, 
  price, 
  onClose, 
  onConfirm, 
  isProcessing 
}) {
  const [paymentData, setPaymentData] = useState({
    username: "",
    pin: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(paymentData);
  };

  const handleChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      {/* Blur Background Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Complete Your Booking</h2>
                <div className="mt-2 space-y-1">
                  <p className="text-indigo-100 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {bookingDate}
                  </p>
                  <p className="text-indigo-100 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {selectedSlotInfo.slot}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">Rs {price}</div>
                <div className="text-indigo-200 text-sm">Fixed Rate</div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Demo Username
              </label>
              <input
                type="text"
                name="username"
                value={paymentData.username}
                onChange={handleChange}
                placeholder="Enter demo username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500 mt-2">
                Use demo account credentials for testing
              </p>
            </div>

            {/* PIN Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PIN
              </label>
              <input
                type="password"
                name="pin"
                value={paymentData.pin}
                onChange={handleChange}
                placeholder="Enter 4-digit PIN"
                maxLength="4"
                pattern="[0-9]{4}"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
                disabled={isProcessing}
              />
            </div>

            {/* Demo Account Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-semibold text-amber-800 text-sm mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Demo Accounts for Testing
              </h4>
              <div className="text-xs text-amber-700 space-y-2">
                <div className="bg-amber-100 p-2 rounded">
                  <div className="font-bold">Account 1 (Recommended)</div>
                  <div>Username: <strong>demo1</strong></div>
                  <div>PIN: <strong>1234</strong></div>
                  <div>Balance: Rs 1000</div>
                </div>
                <div className="bg-amber-100 p-2 rounded">
                  <div className="font-bold">Account 2</div>
                  <div>Username: <strong>demo2</strong></div>
                  <div>PIN: <strong>5678</strong></div>
                  <div>Balance: Rs 500</div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Confirm Payment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}