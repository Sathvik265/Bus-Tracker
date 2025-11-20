import React, { useState, useEffect } from 'react';
import { Seat, SeatLayout, SeatStatus } from '../types';

interface SeatSelectorProps {
  seatLayout: SeatLayout;
  onSelectionChange: (seats: Seat[]) => void;
}

const getSeatColor = (status: SeatStatus) => {
  switch (status) {
    case 'available':
      return 'bg-emerald-100/80 border-emerald-300 text-emerald-800 hover:bg-emerald-200/80';
    case 'booked':
      return 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed';
    case 'ladies':
      return 'bg-pink-100/80 border-pink-300 text-pink-800 hover:bg-pink-200/80';
    case 'selected':
      return 'bg-brand border-amber-600 text-white shadow-lg';
    default:
      return 'bg-gray-200 border-gray-400';
  }
};

const SeatComponent: React.FC<{ seat: Seat; onClick: (seat: Seat) => void; isSleeper: boolean }> = ({ seat, onClick, isSleeper }) => {
  const dimensions = isSleeper ? 'w-24 h-12' : 'w-10 h-10 md:w-12 md:h-12';
  const fontSize = isSleeper ? 'text-sm' : 'text-xs';
  
  return (
    <button
      onClick={() => onClick(seat)}
      disabled={seat.status === 'booked'}
      className={`flex items-center justify-center border-2 rounded-lg transition-all duration-200 ${dimensions} ${getSeatColor(seat.status)} ${fontSize} font-bold`}
    >
      {seat.label}
    </button>
  );
};

const SeatSelector: React.FC<SeatSelectorProps> = ({ seatLayout, onSelectionChange }) => {
  const [seats, setSeats] = useState<Seat[]>(seatLayout.seats);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  
  const isSleeperLayout = seats.some(s => s.type === 'sleeper');
  const cols = isSleeperLayout ? 3 : 5;

  useEffect(() => {
    // React to external changes in seat layout (e.g., from polling)
    setSeats(currentSeats => {
        // Create a map of current statuses to preserve 'selected' state if possible
        const statusMap = new Map<string, SeatStatus>();
        currentSeats.forEach(s => statusMap.set(s.id, s.status));

        return seatLayout.seats.map(newSeat => {
            const currentStatus = statusMap.get(newSeat.id);
            // If the seat is now booked externally, respect that
            if (newSeat.status === 'booked') {
                return newSeat;
            }
            // If it was selected by the current user, keep it selected
            if (currentStatus === 'selected') {
                return { ...newSeat, status: 'selected' };
            }
            return newSeat;
        });
    });
  }, [seatLayout]);


  const handleSeatClick = (clickedSeat: Seat) => {
    if (clickedSeat.status === 'booked') return;

    const newSelectedIds = new Set(selectedSeatIds);
    if (newSelectedIds.has(clickedSeat.id)) {
      newSelectedIds.delete(clickedSeat.id);
    } else {
      if (newSelectedIds.size < 6) { // Max 6 seats
          newSelectedIds.add(clickedSeat.id);
      } else {
          alert('You can select a maximum of 6 seats.');
      }
    }
    setSelectedSeatIds(newSelectedIds);

    const updatedSeats: Seat[] = seats.map(seat => {
      if (seat.status === 'booked') return seat;
      
      if (newSelectedIds.has(seat.id)) {
        return { ...seat, status: 'selected' };
      }
      return { ...seat, status: seat.isLadies ? 'ladies' : 'available' };
    });
    setSeats(updatedSeats);

    onSelectionChange(updatedSeats.filter(s => newSelectedIds.has(s.id)));
  };

  const renderSeats = () => {
    const seatGrid: (Seat | null)[][] = Array.from({ length: seatLayout.rows }, () => Array(cols).fill(null));
    seats.forEach(seat => {
        let r = -1, c = -1;
        const seatNum = parseInt(seat.label.replace(/\D/g, ''));

        if (isSleeperLayout) { // 1-1 layout (2 seats per row)
            const row = Math.floor((seatNum -1) / 2);
            const col = (seatNum - 1) % 2;
            r = row;
            c = col === 0 ? 0 : 2;
        } else { // 2-2 layout (4 seats per row)
            const row = Math.floor((seatNum - 1) / 4);
            const colInRow = (seatNum - 1) % 4;
            r = row;
            c = colInRow < 2 ? colInRow : colInRow + 1;
        }

        if (r >= 0 && r < seatLayout.rows && c >= 0 && c < cols) {
            seatGrid[r][c] = seat;
        }
    });

    return seatGrid.map((row, rowIndex) => (
      <div key={rowIndex} className={`flex justify-between items-center ${isSleeperLayout ? 'gap-x-12' : 'gap-x-4'}`}>
        {row.map((seat, colIndex) => (
            <div key={colIndex} className="p-1">
            {seat ? (
                <SeatComponent seat={seat} onClick={handleSeatClick} isSleeper={isSleeperLayout} />
            ) : (
                <div className={`w-10 h-10 md:w-12 md:h-12`}></div> // Aisle space
            )}
            </div>
        ))}
      </div>
    ));
  };


  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-slate-800">Select Your Seats</h3>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-slate-600">
        <div className="flex items-center"><div className="w-4 h-4 rounded-md bg-emerald-100/80 border border-emerald-300 mr-2"></div><span>Available</span></div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-md bg-pink-100/80 border border-pink-300 mr-2"></div><span>Ladies</span></div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-md bg-gray-200 border border-gray-300 mr-2"></div><span>Booked</span></div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-md bg-brand border-amber-600 mr-2"></div><span>Selected</span></div>
      </div>
      
      <div className="flex justify-between items-center p-2 mb-4 border-t border-b border-gray-200">
        <span className="text-sm font-medium text-slate-500">Lower Deck</span>
        <div className="flex items-center justify-center p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22V14"/>
                <path d="M5 14h14"/>
                <path d="M12 14v-4"/>
                <path d="M12 10V8"/>
                <path d="M12 8a2 2 0 1 0-4 0v2"/>
                <path d="M12 8a2 2 0 1 1 4 0v2"/>
            </svg>
            <span className="ml-2 font-semibold text-slate-600">Driver</span>
        </div>
      </div>

      <div className="overflow-x-auto p-4 bg-gray-50 rounded-md">
        <div className="inline-block space-y-2">
            {renderSeats()}
        </div>
      </div>
    </div>
  );
};

export default SeatSelector;
