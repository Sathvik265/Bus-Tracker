import React, { useState, useCallback } from 'react';
import { Trip, Booking, SearchCriteria, User } from './types';
import { MOCK_TRIPS, MOCK_BOOKINGS } from './constants';
import Header from './components/Header';
import HomePage from './components/pages/HomePage';
import SearchResultsPage from './components/pages/SearchResultsPage';
import MyBookingsPage from './components/pages/MyBookingsPage';
import LoginModal from './components/LoginModal';
import { GoogleGenAI, Type } from "@google/genai";

type View = 'HOME' | 'SEARCH_RESULTS' | 'MY_BOOKINGS';

const App: React.FC = () => {
  const [view, setView] = useState<View>('HOME');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [searchResults, setSearchResults] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSearch = useCallback(async (criteria: SearchCriteria) => {
    setLoading(true);
    setError(null);
    setSearchCriteria(criteria);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a realistic JSON array of 5 bus trips for KSRTC from ${criteria.from} to ${criteria.to} for the date ${criteria.date}. Include an array of 3 to 5 realistic stop objects for the route, each with a 'name' and 'coords'. Ensure bus registration numbers start with 'KA'. All data should be realistic. If status is 'onroute', provide a plausible 'currentLocation' coordinate array [lat, lng]. Ensure startTime is on the specified date and endTime is the next day.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique trip ID, e.g., T05" },
                routeId: { type: Type.STRING, description: "Route ID, e.g., R01" },
                busId: { type: Type.STRING, description: "Bus ID, e.g., B01" },
                startTime: { type: Type.STRING, description: "ISO 8601 format for the journey date." },
                endTime: { type: Type.STRING, description: "ISO 8601 format, arriving the next day." },
                fare: { type: Type.NUMBER },
                status: { type: Type.STRING, enum: ['scheduled', 'onroute'] },
                seatsAvailable: { type: Type.INTEGER },
                route: {
                  type: Type.OBJECT,
                  required: ['id', 'origin', 'destination', 'stops', 'distanceKm'],
                  properties: {
                    id: { type: Type.STRING },
                    origin: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, coords: { type: Type.ARRAY, items: { type: Type.NUMBER } } } },
                    destination: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, coords: { type: Type.ARRAY, items: { type: Type.NUMBER } } } },
                    stops: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, coords: { type: Type.ARRAY, items: { type: Type.NUMBER } } } } },
                    distanceKm: { type: Type.NUMBER },
                  }
                },
                bus: {
                  type: Type.OBJECT,
                   required: ['id', 'registrationNumber', 'capacity', 'operator', 'type', 'seatLayout'],
                  properties: {
                    id: { type: Type.STRING },
                    registrationNumber: { type: Type.STRING },
                    capacity: { type: Type.INTEGER },
                    operator: { type: Type.STRING, description: "Should be KSRTC" },
                    type: { type: Type.STRING, enum: ['Non-AC Seater', 'AC Sleeper', 'Volvo Multi-Axle'] },
                    seatLayout: {
                      type: Type.OBJECT,
                      required: ['rows', 'cols', 'seats'],
                      properties: {
                        rows: { type: Type.INTEGER },
                        cols: { type: Type.INTEGER },
                        seats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, label: { type: Type.STRING }, status: { type: Type.STRING, enum: ['available', 'booked', 'ladies'] }, type: { type: Type.STRING, enum: ['seater', 'sleeper'] }, isLadies: { type: Type.BOOLEAN } } } }
                      }
                    }
                  }
                },
                currentLocation: {
                  type: Type.ARRAY,
                  description: "Optional: [lat, lng] if status is 'onroute'",
                  items: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      });
      
      const generatedTrips = JSON.parse(response.text);
      setSearchResults(generatedTrips);

    } catch (e) {
      console.error(e);
      setError("Failed to fetch real-time data. Displaying available mock results.");
      const results = MOCK_TRIPS.filter(trip =>
        trip.route.origin.name.toLowerCase() === criteria.from.toLowerCase() &&
        trip.route.destination.name.toLowerCase() === criteria.to.toLowerCase()
      );
      setSearchResults(results);
    } finally {
      setView('SEARCH_RESULTS');
      setLoading(false);
    }
  }, []);

  const handleNavigate = (targetView: View) => {
    if (targetView === 'MY_BOOKINGS' && !isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    setView(targetView);
  }

  const handleLogin = () => {
    // Simulate login
    setIsLoggedIn(true);
    setCurrentUser({ id: 'user123', name: 'Guest User', avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=Guest` });
    setIsLoginModalOpen(false);
    setView('MY_BOOKINGS'); // Navigate to bookings after login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setView('HOME'); // Navigate to home after logout
  };
  
  const handleCancelBooking = (bookingId: string) => {
    setBookings(prevBookings => prevBookings.map(b => 
      b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
    ));
  };

  const renderView = () => {
    switch (view) {
      case 'HOME':
        return <HomePage onSearch={handleSearch} loading={loading} />;
      case 'SEARCH_RESULTS':
        return searchCriteria && <SearchResultsPage trips={searchResults} searchCriteria={searchCriteria} error={error} />;
      case 'MY_BOOKINGS':
        return <MyBookingsPage bookings={bookings} trips={MOCK_TRIPS} onCancelBooking={handleCancelBooking} />;
      default:
        return <HomePage onSearch={handleSearch} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-700">
      <Header 
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        user={currentUser}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />
      {isLoginModalOpen && (
        <LoginModal onLogin={handleLogin} onClose={() => setIsLoginModalOpen(false)} />
      )}
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;