import React from 'react';
import { Booking } from '../../types';

interface ConfirmationPageProps {
  booking: Booking;
  onNavigateHome: () => void;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ booking, onNavigateHome }) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Booking Confirmed!</h2>
        <p className="mt-2 text-slate-600">Your ticket has been successfully booked.</p>

        <div className="mt-8 text-left border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-slate-500">Booking ID:</dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2 font-bold text-right">{booking.id}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-slate-500">Seats:</dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2 font-bold text-brand-dark text-right">{booking.seats.map(s => s.seatId).join(', ')}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-slate-500">Total Amount:</dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2 font-bold text-right">₹{booking.totalAmount.toFixed(2)}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-slate-500">Booking Date:</dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2 font-bold text-right">{new Date(booking.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
                </div>
            </dl>
        </div>
        
        <div className="mt-8 flex flex-col items-center">
            <p className="mb-4 text-slate-600">Show this QR code at boarding.</p>
            <div className="p-4 bg-white border-4 border-slate-800 rounded-lg shadow-sm">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${JSON.stringify({bookingId: booking.id, seats: booking.seats.map(s => s.seatId)})}`} alt="QR Code" />
            </div>
        </div>

        <div className="mt-10">
          <button
            onClick={onNavigateHome}
            className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Book Another Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;