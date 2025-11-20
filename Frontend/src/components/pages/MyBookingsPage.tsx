import React from 'react';
import { Booking, Trip } from '../../types';

interface MyBookingsPageProps {
  bookings: Booking[];
  trips: Trip[];
  onCancelBooking: (bookingId: string) => void;
}

const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ bookings, trips, onCancelBooking }) => {
  
  const getTripForBooking = (booking: Booking): Trip | undefined => {
    return trips.find(t => t.id === booking.tripId);
  };

  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const pastBookings = bookings.filter(b => b.status !== 'CONFIRMED');

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const trip = getTripForBooking(booking);
    if (!trip) return null;

    const bookingDate = new Date(trip.startTime);

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200/80 animate-fade-in">
        <div className={`p-4 border-l-4 ${booking.status === 'CONFIRMED' ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500">Booking ID: {booking.id}</p>
              <h3 className="font-bold text-xl text-slate-800">
                {trip.route.origin.name} to {trip.route.destination.name}
              </h3>
              <p className="text-slate-600">
                {bookingDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className={`text-sm font-bold py-1 px-3 rounded-full ${
              booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
              booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {booking.status}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Departure</p>
                <p className="font-semibold text-slate-700">{new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-slate-500">Bus Type</p>
                <p className="font-semibold text-slate-700">{trip.bus.type}</p>
              </div>
              <div>
                <p className="text-slate-500">Seats</p>
                <p className="font-semibold text-slate-700">{booking.seats.map(s => s.seatId).join(', ')}</p>
              </div>
              <div>
                <p className="text-slate-500">Total Fare</p>
                <p className="font-bold text-lg text-slate-800">₹{booking.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {booking.status === 'CONFIRMED' && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-right">
              <button 
                onClick={() => onCancelBooking(booking.id)}
                className="bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-200 transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">My Bookings</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">Upcoming Trips</h3>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-6">
              {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          ) : (
            <p className="text-slate-500">You have no upcoming trips.</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">Past Trips</h3>
          {pastBookings.length > 0 ? (
            <div className="space-y-6">
              {pastBookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          ) : (
            <p className="text-slate-500">No past trips to show.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
