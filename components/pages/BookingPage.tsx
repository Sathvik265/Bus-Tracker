import React, { useState, useEffect, useCallback } from 'react';
import { Trip, Seat, Booking } from '../../types';
import SeatSelector from '../SeatSelector';
import { v4 as uuidv4 } from 'uuid';

interface BookingPageProps {
  trip: Trip;
  onConfirmBooking: (booking: Booking) => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ trip, onConfirmBooking }) => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [totalFare, setTotalFare] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes hold
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const handleSeatSelection = useCallback((seats: Seat[]) => {
    setSelectedSeats(seats);
    setTotalFare(seats.length * trip.fare);
  }, [trip.fare]);

  const handleBookingConfirm = () => {
    setIsBooking(true);
    // Simulate API call
    setTimeout(() => {
      const booking: Booking = {
        id: `BK-${uuidv4().slice(0, 8).toUpperCase()}`,
        tripId: trip.id,
        userId: 'user123', // Mock user
        seats: selectedSeats.map(s => ({ seatId: s.id, price: trip.fare })),
        totalAmount: totalFare,
        status: 'HOLD',
        createdAt: new Date().toISOString(),
      };
      onConfirmBooking(booking);
      setIsBooking(false);
    }, 2000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <SeatSelector
                seatLayout={trip.bus.seatLayout}
                onSelectionChange={handleSeatSelection}
            />
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-xl p-6 sticky top-24 border border-gray-200">
            <h2 className="text-2xl font-bold border-b border-gray-200 pb-4 mb-4 text-slate-800">Booking Summary</h2>
            <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between"><span className="font-semibold text-slate-500">Route:</span> <span className="font-bold text-right text-slate-800">{trip.route.origin.name} to {trip.route.destination.name}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-slate-500">Date:</span> <span className="font-bold text-slate-800">{new Date(trip.startTime).toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-slate-500">Departure:</span> <span className="font-bold text-slate-800">{new Date(trip.startTime).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true})}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-slate-500">Bus:</span> <span className="font-bold text-slate-800">{trip.bus.type}</span></div>
            </div>
            
            <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-2 text-slate-800">Selected Seats ({selectedSeats.length})</h3>
                <div className="flex flex-wrap gap-2">
                    {selectedSeats.length > 0 ? selectedSeats.map(seat => (
                        <span key={seat.id} className="bg-amber-300 text-amber-800 font-bold px-3 py-1 rounded-md text-sm">{seat.label}</span>
                    )) : <p className="text-slate-500 text-sm">Please select your seats from the layout.</p>}
                </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                    <span>Total Fare:</span>
                    <span className="text-2xl">₹{totalFare.toFixed(2)}</span>
                </div>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md text-center">
              <p className="font-bold">Seats are held for: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</p>
            </div>

            <button
              onClick={handleBookingConfirm}
              disabled={selectedSeats.length === 0 || isBooking}
              className="mt-6 w-full bg-brand-dark hover:bg-brand-dark/90 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-brand/50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {isBooking ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Proceed to Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;