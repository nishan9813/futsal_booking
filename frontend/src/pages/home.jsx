
// // Home.js
// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
// import axiosClient from "../authenticated/axiosCredint";
// import ActiveBookings from "../component/bookingUpdates";

// function Home() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [bookings, setBookings] = useState([]);
//   const navigate = useNavigate(); // Initialize the useNavigate hook

//   useEffect(() => {
//     axiosClient
//       .get("/api/current_user/")
//       .then((res) => setUser(res.data.user || res.data))
//       .catch(() => setUser(null))
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     if (!user) return;
//     axiosClient
//       .get("/api/user-history/")
//       .then((res) => setBookings(res.data.slice(0, 5)))
//       .catch((err) => {
//         console.error("Failed to fetch bookings:", err);
//         setBookings([]);
//       });
//   }, [user]);

//   const isPastBooking = (dateStr, timeStr) => {
//     const [start] = timeStr.split(" - ");
//     const bookingDateTime = new Date(`${dateStr} ${start}`);
//     return bookingDateTime < new Date();
//   };

//   // Navigate to the history page when the button is clicked
//   const handleViewHistory = () => {
//     navigate("/all-bookings");
//   };

//   if (loading)
//     return (
//       <p className="loading-text animate-fade-in">Loading your data...</p>
//     );

//   return (
//     <div className="flex flex-col min-h-screen">
//       <main className="flex-grow">
//         {/* Hero Section (unchanged) */}
//         <section
//           className="relative min-h-[60vh] flex items-center justify-center text-white bg-cover bg-center"
//           style={{
//             backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDjqPql8l0DDFTDO-5oxRmSwMtI2MfTtyiBwISwqP9vlat_K0AEFxVjtjy3RvW7QTYf_oPzjBwr8IMPn3zN_fw8bCx9PvaykYfJ5_fUnOv2j2WrRlDTZmFbrM1DGOQ1KiQBY1O6Y6O1ATTsruhWZ7JOYzT31WkP8xytTpDhek_oI-Hjj8_Bcye48aeymOe8GuWy9ae2jAk-RQ3oSGY5AlYeaji9YGgBdwXl2_Be6j54MPDvPgElV8-4btcf-BJ56oYnA20tlTcuE0Kd")`,
//           }}
//         >
//           <div className="absolute inset-0 hero-gradient"></div>
//           <div className="relative z-10 text-center px-4 max-w-3xl animate-fade-in-up">
//             <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
//               Find & Book Your Perfect Futsal Ground
//             </h1>
//             <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
//               Book your next game with ease. Explore top-rated futsal grounds near you and manage your bookings effortlessly.
//             </p>
//             <Link
//               to="/grounds"
//               className="btn-primary rounded-full h-14 px-8 text-lg font-bold shadow-lg hover:shadow-xl"
//             >
//               Book Now
//             </Link>
//           </div>
//         </section>

//         {/* Recent Bookings Section */}
//         <div className="container mx-auto px-6 lg:px-8 py-16 lg:py-24">
//           <ActiveBookings
//             bookings={bookings}
//             user={user}
//             isPastBooking={isPastBooking}
//           />
//         </div>

//         {/* View History Button */}
//         <div className="container mx-auto px-6 lg:px-8 py-4">
//           <button
//             onClick={handleViewHistory} // Handle navigation on button click
//             className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             View History
//           </button>
//         </div>
//       </main>

//       {/* Footer (unchanged) */}
//       <footer className="bg-gray-800 text-white">
//         {/* Footer content here */}
//       </footer>
//     </div>
//   );
// }

// export default Home;


// Home.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../authenticated/axiosCredint";
import ActiveBookings from "../component/bookingUpdates";

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient
      .get("/api/current_user/")
      .then((res) => setUser(res.data.user || res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    axiosClient
      .get("/api/user-history/")
      .then((res) => setBookings(res.data.slice(0, 5)))
      .catch((err) => {
        console.error("Failed to fetch bookings:", err);
        setBookings([]);
      });
  }, [user]);

  const isPastBooking = (dateStr, timeStr) => {
    const [start] = timeStr.split(" - ");
    const bookingDateTime = new Date(`${dateStr} ${start}`);
    return bookingDateTime < new Date();
  };

  const handleViewHistory = () => {
    navigate("/all-bookings");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your data...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80")`,
            }}
          />
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              <span className="text-sm font-medium text-white">Live Booking Available</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Find & Book
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Perfect Futsal
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover premium futsal grounds, book instantly, and manage your games with our seamless platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/grounds"
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg px-12 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="relative z-10">Book Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <button className="group border-2 border-white/30 hover:border-white/50 text-white font-semibold text-lg px-8 py-4 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <span className="flex items-center gap-2">
                  Watch Demo
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/20">
              {[
                { number: "500+", label: "Active Players" },
                { number: "50+", label: "Futsal Grounds" },
                { number: "24/7", label: "Support" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Recent Bookings Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bookings</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your upcoming games and track your futsal history
            </p>
          </div>

          {/* Bookings Component */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <ActiveBookings
              bookings={bookings}
              user={user}
              isPastBooking={isPastBooking}
            />
          </div>

          {/* View History Button */}
          {bookings.length > 0 && (
            <div className="text-center mt-12">
              <button
                onClick={handleViewHistory}
                className="group bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="flex items-center gap-3">
                  View Complete History
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Us?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "⚡",
                title: "Instant Booking",
                description: "Book your favorite futsal ground in seconds with our streamlined process"
              },
              {
                icon: "🎯",
                title: "Best Locations",
                description: "Discover top-rated futsal grounds near you with real-time availability"
              },
              {
                icon: "📱",
                title: "Easy Management",
                description: "Manage all your bookings and payments from one simple dashboard"
              }
            ].map((feature, index) => (
              <div key={index} className="group text-center p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;