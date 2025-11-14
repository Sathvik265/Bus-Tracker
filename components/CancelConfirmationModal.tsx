import React from 'react';
import { Booking } from '../types';

interface CancelConfirmationModalProps {
  booking: Booking;
  onConfirm: () => void;
  onClose: () => void;
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({ booking, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl p-8 m-4 max-w-md w-full relative transform transition-all duration-300 scale-100">
        <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-danger-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-bold text-gray-900">
                    Cancel Booking
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        Are you sure you want to cancel your booking for seat(s) <strong className="text-brand-dark">{booking.seats.map(s => s.seatId).join(', ')}</strong>? This action cannot be undone.
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
                type="button"
                onClick={onConfirm}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-danger-dark text-base font-medium text-white hover:bg-danger-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger sm:ml-3 sm:w-auto sm:text-sm"
            >
                Confirm Cancellation
            </button>
            <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand sm:mt-0 sm:w-auto sm:text-sm"
            >
                Keep Booking
            </button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmationModal;