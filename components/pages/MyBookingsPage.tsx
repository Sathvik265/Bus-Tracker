import React, { useState } from 'react';
import { Booking, Trip } from '../../types';
import CancelConfirmationModal from '../CancelConfirmationModal';

interface MyBookingsPageProps {
  bookings: Booking[];
  trips: Trip[];
  onCancelBooking: (bookingId: string) => void;
}

const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ bookings, trips, onCancelBooking }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const getTripForBooking = (tripId: string): Trip | undefined => {
    return trips.find(t => t.id === tripId);
  }

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setIsModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      onCancelBooking(bookingToCancel.id);
    }
    setIsModalOpen(false);
    setBookingToCancel(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {isModalOpen && bookingToCancel && (
        <CancelConfirmationModal 
          booking={bookingToCancel}
          onConfirm={handleConfirmCancel}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <h1 className="text-3xl font-bold mb-6 text-slate-800">My Bookings</h1>
      
      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map(booking => {
            const trip = getTripForBooking(booking.tripId);
            if (!trip) return null;
            const isCancelled = booking.status === 'CANCELLED';
            return (
              <div key={booking.id} className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 transition-opacity ${isCancelled ? 'opacity-60' : ''}`}>
                <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-200 pb-4 mb-4">
                  <div>
                    <p className="font-bold text-xl text-slate-800">{trip.route.origin.name} → {trip.route.destination.name}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(trip.startTime).toDateString()} - {new Date(trip.startTime).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true})}
                    </p>
                  </div>
                  <div className={`mt-2 md:mt-0 px-3 py-1 text-sm font-semibold rounded-full ${
                      isCancelled ? 'bg-gray-200 text-gray-600' : 
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {booking.status}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Booking ID</p>
                    <p className="font-semibold text-slate-700">{booking.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Bus</p>
                    <p className="font-semibold text-slate-700">{trip.bus.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Seats</p>
                    <p className={`font-semibold text-brand-dark ${isCancelled ? 'line-through' : ''}`}>{booking.seats.map(s => s.seatId).join(', ')}</p>
                  </div>
                   <div>
                    <p className="text-slate-500">Total Fare</p>
                    <p className={`font-semibold text-slate-700 ${isCancelled ? 'line-through' : ''}`}>₹{booking.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                 <div className="mt-6 flex justify-end space-x-4">
                     <button 
                       onClick={() => handleCancelClick(booking)}
                       disabled={isCancelled}
                       className="text-sm font-semibold text-slate-600 hover:text-danger transition-colors disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:text-gray-400">
                         {isCancelled ? 'Cancelled' : 'Cancel Ticket'}
                     </button>
                    <button className="text-sm font-semibold bg-brand-dark text-white py-2 px-4 rounded-lg hover:bg-brand-dark/90 transition-colors shadow-sm hover:shadow-md">Download Ticket</button>
                 </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-800">No bookings found.</h2>
          <p className="text-slate-500 mt-2">Your booked tickets will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;