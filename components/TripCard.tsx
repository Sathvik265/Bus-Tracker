import React from 'react';
import { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  isSelected: boolean;
  onSelectTrip: (tripId: string) => void;
}

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};

const BusIcon: React.FC<{className?: string; style?: React.CSSProperties}> = ({className, style}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 8a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H4a2 2 0 00-2 2v4H1a1 1 0 000 2h1v4a2 2 0 002 2h1v2a1 1 0 002 0v-2h8v2a1 1 0 002 0v-2h1a2 2 0 002-2v-4h1a1 1 0 000-2h-1V8zm-2 0h-1V6h1v2zm-2-2V4H6v2h8zM6 8V6h1v2H6zm10 4H4v4h12v-4z" clipRule="evenodd" />
        <path d="M7 14a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
);

const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const TripCard: React.FC<TripCardProps> = ({ trip, isSelected, onSelectTrip }) => {
  const origin = encodeURIComponent(trip.route.origin.name);
  const destination = encodeURIComponent(trip.route.destination.name);
  const travelDate = new Date(trip.startTime);
  const day = String(travelDate.getDate()).padStart(2, '0');
  const month = String(travelDate.getMonth() + 1).padStart(2, '0');
  const year = travelDate.getFullYear();
  const formattedDate = `${year}-${month}-${day}`;
  
  const bookingUrl = `https://www.redbus.in/search?fromCityName=${origin}&toCityName=${destination}&onward=${formattedDate}`;

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden transition-all duration-300 cursor-pointer ${isSelected ? 'scale-[1.01] ring-2 ring-brand' : 'hover:shadow-xl'}`}
      onClick={() => onSelectTrip(trip.id)}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6">
        
        <div className="md:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <p className="font-bold text-lg text-slate-800">{trip.bus.operator} - <span className="font-mono">{trip.bus.registrationNumber}</span></p>
                <p className="text-sm text-slate-500">{trip.bus.type}</p>
              </div>
              <div className="flex items-center space-x-4">
                {trip.status === 'onroute' && (
                  <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    <span>Live Tracking</span>
                  </div>
                )}
                 <ChevronDownIcon className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`} />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-center">
              <div>
                <p className="text-xl font-bold text-slate-800">{formatTime(trip.startTime)}</p>
                <p className="text-sm text-slate-500">{trip.route.origin.name}</p>
              </div>
              <div className="flex-grow text-center px-4">
                <p className="text-xs text-slate-500">{getDuration(trip.startTime, trip.endTime)}</p>
                <div className="relative w-full h-1 bg-gray-200 rounded-full my-1">
                    <div className="absolute h-1 bg-brand rounded-full" style={{width: '100%'}}></div>
                    <BusIcon className="absolute -top-2 h-5 w-5 text-brand-dark transition-all duration-1000 ease-linear" style={{left: trip.status === 'onroute' ? '40%' : '0%'}}/>
                </div>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{formatTime(trip.endTime)}</p>
                <p className="text-sm text-slate-500">{trip.route.destination.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-gray-200 md:pl-6 pt-4 md:pt-0 flex flex-col justify-between items-center md:items-end text-center md:text-right">
            <div className="flex-grow flex flex-col justify-center items-center md:items-end">
                <p className="text-2xl font-extrabold text-slate-800">₹ {trip.fare.toFixed(2)}</p>
                <p className="text-green-600 font-bold">{trip.seatsAvailable} seats available</p>
                <p className="text-sm text-slate-500">{trip.bus.seatLayout.seats.some(s => s.type === 'sleeper') ? 'Sleeper available' : 'Seater only'}</p>
            </div>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} 
              className="w-full md:w-auto mt-4 bg-brand-dark hover:bg-brand-dark/90 text-white font-bold py-2 px-6 rounded-xl transition-colors text-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Book Seats
            </a>
        </div>
      </div>
    </div>
  );
};

export default TripCard;