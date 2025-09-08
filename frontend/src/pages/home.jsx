import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../authenticated/axiosCredint";

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

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

  if (loading)
    return (
      <p className="loading-text animate-fade-in">Loading your data...</p>
    );

  const isPastBooking = (dateStr, timeStr) => {
    const [start] = timeStr.split(" - ");
    const bookingDateTime = new Date(`${dateStr} ${start}`);
    return bookingDateTime < new Date();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-grow">
        <section
          className="relative min-h-[60vh] flex items-center justify-center text-white bg-cover bg-center"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDjqPql8l0DDFTDO-5oxRmSwMtI2MfTtyiBwISwqP9vlat_K0AEFxVjtjy3RvW7QTYf_oPzjBwr8IMPn3zN_fw8bCx9PvaykYfJ5_fUnOv2j2WrRlDTZmFbrM1DGOQ1KiQBY1O6Y6O1ATTsruhWZ7JOYzT31WkP8xytTpDhek_oI-Hjj8_Bcye48aeymOe8GuWy9ae2jAk-RQ3oSGY5AlYeaji9YGgBdwXl2_Be6j54MPDvPgElV8-4btcf-BJ56oYnA20tlTcuE0Kd")`,
          }}
        >
          <div className="absolute inset-0 hero-gradient"></div>
          <div className="relative z-10 text-center px-4 max-w-3xl animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4">
              Find & Book Your Perfect Futsal Ground
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Book your next game with ease. Explore top-rated futsal grounds
              near you and manage your bookings effortlessly.
            </p>
            <Link
              to="/grounds"
              className="btn-primary rounded-full h-14 px-8 text-lg font-bold tracking-wide shadow-lg hover:shadow-xl"
            >
              Book Now
            </Link>
          </div>
        </section>

        <div className="container mx-auto px-6 lg:px-8 py-16 lg:py-24">
          {user && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8 text-center">
                Your Recent Bookings
              </h2>
              {bookings.length === 0 ? (
                <div className="text-center text-gray-600">
                  <p>
                    No bookings yet.{" "}
                    <Link
                      to="/grounds"
                      className="text-indigo-600 hover:underline"
                    >
                      Explore grounds
                    </Link>{" "}
                    to book your first game.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Ground</th>
                          <th className="px-6 py-3">Location</th>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Time</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => {
                          const past = isPastBooking(
                            booking.booking_date,
                            booking.time_slot
                          );
                          return (
                            <tr
                              key={booking.id}
                              className={`bg-white border-b hover:bg-gray-50 transition-colors ${
                                past ? "opacity-50" : ""
                              }`}
                            >
                              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                {booking.futsal_name}
                              </td>
                              <td className="px-6 py-4">
                                {booking.ground_type}
                              </td>
                              <td className="px-6 py-4">
                                {booking.booking_date}
                              </td>
                              <td className="px-6 py-4">
                                {booking.time_slot}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${
                                    past
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {past ? "Completed" : "Upcoming"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Link
                                  className="font-medium text-indigo-600 hover:underline"
                                  to={`/booking/${booking.id}`}
                                >
                                  Manage
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* View All Bookings Button */}
                  <div className="mt-6 text-center">
                    <Link
                      to="/all-bookings"
                      className="inline-block bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                    >
                      View All Bookings
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {!user && (
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <img
                  className="w-full max-w-sm rounded-lg"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbFBH_oH6pflFnjXkdSqepz7AOy26UvFSVIwydum5flmyIgFre6QnwHYgUq7Ht9eROqqfv--GJKE2vVaSwcoy3dTbIF8DwRUQfq68QnFAq_wppfFxfZsLSAAYiuWEuw2bF-xb6R5DGceZpz1Cdrryz-728dnSkF_-F1Lu6ZRbL4Ptynky_CQyLanCl5DsZgaKa09NDBA-SbRrtHnP28WmyHiQrWW5aiuyhU53NMLE67IaXsMrheVM_16q_sK7oIFgnNqXnh0F__Qvy"
                  alt="Empty state illustration of a futsal court"
                />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                No Bookings Yet
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
                Log in to view your bookings or start exploring grounds to find
                your next game.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link
                  to="/login"
                  className="btn-primary rounded-lg h-12 px-6 text-base font-bold tracking-wide"
                >
                  Log In to View Bookings
                </Link>
                <Link
                  to="/grounds"
                  className="btn-secondary rounded-lg h-12 px-6 text-base font-bold tracking-wide"
                >
                  Explore Grounds
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link
                className="flex items-center gap-3 text-2xl font-bold"
                to="#"
              >
                <svg
                  className="h-8 w-8 text-indigo-600"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                    fill="currentColor"
                  ></path>
                </svg>
                FutsalGo
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0 text-gray-400">
              <Link className="hover:text-white transition-colors" to="#">
                About
              </Link>
              <Link className="hover:text-white transition-colors" to="#">
                Terms of Service
              </Link>
              <Link className="hover:text-white transition-colors" to="#">
                Privacy Policy
              </Link>
              <Link className="hover:text-white transition-colors" to="#">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
            <p>© 2025 FutsalGo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
