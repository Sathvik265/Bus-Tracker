import React, { useState, useEffect } from 'react';
import { Trip, SearchCriteria } from '../../types';
import TripCard from '../TripCard';
import TripDetails from '../TripDetails';

interface SearchResultsPageProps {
  trips: Trip[];
  searchCriteria: SearchCriteria;
  error?: string | null;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ trips, searchCriteria, error }) => {
  const [liveTrips, setLiveTrips] = useState<Trip[]>(trips);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

   useEffect(() => {
    setLiveTrips(trips);
    setSelectedTripId(null); // Reset selection on new search
  }, [trips]);

  useEffect(() => {
    // Simulate real-time bus location updates
    const interval = setInterval(() => {
      setLiveTrips(prevTrips =>
        prevTrips.map(trip => {
          if (trip.status === 'onroute' && trip.currentLocation) {
            return {
              ...trip,
              currentLocation: [
                trip.currentLocation[0] - 0.005, // Simulate movement north
                trip.currentLocation[1] + 0.005, // Simulate movement east
              ] as [number, number],
            };
          }
          return trip;
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSelectTrip = (tripId: string) => {
    setSelectedTripId(currentId => (currentId === tripId ? null : tripId));
  };


  return (
    <div>
      {error && (
        <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Could Not Fetch Live Data</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6 bg-white p-4 rounded-xl shadow-md border border-gray-200/80">
        <h2 className="text-2xl font-bold text-slate-800">
          Buses from <span className="text-brand-dark">{searchCriteria.from}</span> to <span className="text-brand-dark">{searchCriteria.to}</span>
        </h2>
        <p className="text-slate-600">
          <span className="font-semibold">{liveTrips.length} buses found</span> for {new Date(searchCriteria.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      
      {liveTrips.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {liveTrips.map(trip => (
            <React.Fragment key={trip.id}>
              <TripCard 
                trip={trip} 
                isSelected={selectedTripId === trip.id}
                onSelectTrip={handleSelectTrip}
              />
              {selectedTripId === trip.id && <TripDetails trip={trip} />}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-800">No buses found</h3>
          <p className="text-slate-500 mt-2">Please try searching for a different route or date.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;