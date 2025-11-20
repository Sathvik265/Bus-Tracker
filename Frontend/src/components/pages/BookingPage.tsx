import React, { useState, useMemo } from 'react';
import { Trip, Seat, SeatStatus } from '../../types';

interface BookingPageProps {
  trip: Trip;
  onConfirmBooking: (selectedSeats: Seat[]) => void;
}

const SeatComponent: React.FC<{ seat: Seat; onSelect: (seat: Seat) => void; isSelected: boolean }> = ({ seat, onSelect, isSelected }) => {
  const getSeatStyle = (status: SeatStatus, isSelected: boolean) => {
    if (isSelected) return 'bg-green-500 text-white';
    switch (status) {
      case 'available': return 'bg-white border-gray-400 text-gray-700 hover:bg-green-100';
      case 'booked': return 'bg-gray-300 text-gray-500 cursor-not-allowed';
      case 'ladies': return 'bg-pink-200 border-pink-400 text-pink-800 hover:bg-pink-300';
      default: return 'bg-white border-gray-400';
    }
  };

  return (
    <button
      onClick={() => onSelect(seat)}
      disabled={seat.status === 'booked'}
      className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-semibold text-sm transition-all duration-200 ${getSeatStyle(seat.status, isSelected)}`}
    >
      {seat.label}
    </button>
  );
};

const BookingPage: React.FC<BookingPageProps> = ({ trip, onConfirmBooking }) => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  const handleSelectSeat = (seat: Seat) => {
    setSelectedSeats(prev => {
      if (prev.some(s => s.id === seat.id)) {
        return prev.filter(s => s.id !== seat.id);
      }
      return [...prev, seat];
    });
  };

  const totalPrice = useMemo(() => {
    return selectedSeats.length * trip.fare;
  }, [selectedSeats, trip.fare]);

  const seatLayoutGrid = useMemo(() => {
    const grid: (Seat | null)[][] = Array(trip.bus.seatLayout.rows).fill(null).map(() => Array(trip.bus.seatLayout.cols).fill(null));
    trip.bus.seatLayout.seats.forEach(seat => {
      // This is a simplified mapping. A real app would need a more robust way
      // to map seat IDs/labels to grid positions.
      const match = seat.label.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[0], 10) - 1;
        const row = Math.floor(num / (trip.bus.seatLayout.cols - (trip.bus.type === 'AC Sleeper' ? 1 : 2) ));
        const col = num % (trip.bus.seatLayout.cols - (trip.bus.type === 'AC Sleeper' ? 1 : 2));
        
        // This is still not perfect and needs a proper mapping logic
        // For now, we'll just place them sequentially and handle aisles manually
      }
    });
    // A more direct grid generation based on rows/cols is better
    let seatIndex = 0;
    for (let r = 0; r < trip.bus.seatLayout.rows; r++) {
        for (let c = 0; c < trip.bus.seatLayout.cols; c++) {
            const isAisle = trip.bus.seatLayout.cols === 5 && c === 2;
            const isSleeperAisle = trip.bus.seatLayout.cols === 3 && c === 1;
            if (isAisle || isSleeperAisle) {
                grid[r][c] = null; // Aisle
            } else {
                if(seatIndex < trip.bus.seatLayout.seats.length) {
                    grid[r][c] = trip.bus.seatLayout.seats[seatIndex];
                    seatIndex++;
                }
            }
        }
    }
    return grid;
  }, [trip.bus.seatLayout]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-inner border">
        <h3 className="font-bold text-xl mb-4 text-slate-800">Select Your Seats</h3>
        <div className="flex justify-end space-x-4 mb-4 text-xs">
            <div className="flex items-center"><div className="w-4 h-4 rounded bg-white border-2 border-gray-400 mr-2"></div>Available</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded bg-gray-300 mr-2"></div>Booked</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded bg-pink-200 mr-2"></div>Ladies</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded bg-green-500 mr-2"></div>Selected</div>
        </div>
        
        <div className="p-4 bg-gray-100 rounded-lg overflow-x-auto">
            <div className="inline-block">
                {seatLayoutGrid.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-3 mb-3">
                    {row.map((seat, cIdx) => (
                        <div key={cIdx} className="w-12 h-12">
                        {seat ? (
                            <SeatComponent 
                                seat={seat} 
                                onSelect={handleSelectSeat}
                                isSelected={selectedSeats.some(s => s.id === seat.id)}
                            />
                        ) : <div />}
                        </div>
                    ))}
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-inner border sticky top-24">
            <h3 className="font-bold text-xl mb-4 text-slate-800">Booking Summary</h3>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-600">Bus Type:</span>
                    <span className="font-semibold text-slate-800">{trip.bus.type}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Selected Seats:</span>
                    <span className="font-semibold text-slate-800">{selectedSeats.length > 0 ? selectedSeats.map(s => s.label).join(', ') : 'None'}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-600">Fare per seat:</span>
                    <span className="font-semibold text-slate-800">₹{trip.fare.toFixed(2)}</span>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t-2 border-dashed">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-800">Total Price:</span>
                    <span className="text-2xl font-extrabold text-brand-dark">₹{totalPrice.toFixed(2)}</span>
                </div>
            </div>
            <button
                onClick={() => onConfirmBooking(selectedSeats)}
                disabled={selectedSeats.length === 0}
                className="w-full mt-6 bg-danger hover:bg-danger-dark text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
                Confirm Booking
            </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
