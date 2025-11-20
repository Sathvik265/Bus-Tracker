
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Trip, Booking, SearchCriteria, User, Seat } from './types';
import { MOCK_TRIPS, MOCK_BOOKINGS } from './constants';
import Header from './components/Header';
import HomePage from './components/pages/HomePage';
import SearchResultsPage from './components/pages/SearchResultsPage';
import MyBookingsPage from './components/pages/MyBookingsPage';
import ConfirmationPage from './components/pages/ConfirmationPage';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';

type View = 'HOME' | 'SEARCH_RESULTS' | 'MY_BOOKINGS' | 'CONFIRMATION';

// Simulating backend user schema
interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be hashed
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('HOME');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [searchResults, setSearchResults] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  const chatSessionRef = useRef<Chat | null>(null);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // "Backend" Database state
  const [users, setUsers] = useState<StoredUser[]>([]);
  // Trips "Database" state - kept in sync with localStorage
  const [allTrips, setAllTrips] = useState<Trip[]>([]);

  // Initialize AI and Load Data
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: `You are a KSRTC bus system state manager. You will maintain the JSON state of all bus trips. The initial state is provided in the first message. When I send a command, update the internal state and respond ONLY with the updated JSON object or array requested. Do not add any conversational text or markdown formatting. Just raw JSON.`,
          },
        });
        await chat.sendMessage({ message: JSON.stringify(MOCK_TRIPS) });
        chatSessionRef.current = chat;
        console.log("AI State Manager Initialized.");
      } catch (e) {
        console.error("Failed to initialize AI state manager:", e);
        setError("Could not connect to the live data stream.");
      }
    };
    
    initializeChat();

    // Load users from "Database" (localStorage)
    const storedUsers = localStorage.getItem('ksrtc_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    // Load trips from "Database" (localStorage)
    const storedTrips = localStorage.getItem('ksrtc_trips');
    if (storedTrips) {
        setAllTrips(JSON.parse(storedTrips));
    } else {
        // Seed database with mock trips if empty
        localStorage.setItem('ksrtc_trips', JSON.stringify(MOCK_TRIPS));
        setAllTrips(MOCK_TRIPS);
    }
  }, []);

  const handleSearch = useCallback(async (criteria: SearchCriteria) => {
    setLoading(true);
    setError(null);
    setSearchCriteria(criteria);

    // 1. Check "Database" first
    const storedTripsJSON = localStorage.getItem('ksrtc_trips');
    const currentDbTrips: Trip[] = storedTripsJSON ? JSON.parse(storedTripsJSON) : [];
    
    // Parse criteria date safely (YYYY-MM-DD)
    const [searchYear, searchMonth, searchDay] = criteria.date.split('-').map(Number);

    const cachedResults = currentDbTrips.filter(trip => {
        const tripDate = new Date(trip.startTime);
        return (
            trip.route.origin.name.toLowerCase() === criteria.from.toLowerCase() &&
            trip.route.destination.name.toLowerCase() === criteria.to.toLowerCase() &&
            tripDate.getFullYear() === searchYear &&
            tripDate.getMonth() === (searchMonth - 1) &&
            tripDate.getDate() === searchDay
        );
    });

    if (cachedResults.length > 0) {
        console.log("Retrieved trips from local database.");
        setSearchResults(cachedResults);
        setView('SEARCH_RESULTS');
        setLoading(false);
        return;
    }

    console.log("No trips in database, fetching from external service (AI)...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a realistic JSON array of 5 bus trips for KSRTC from ${criteria.from} to ${criteria.to} for the date ${criteria.date}. 
        
        CRITICAL: The 'startTime' MUST be on ${criteria.date}.
        
        Include an array of 3 to 5 realistic stop objects for the route, each with a 'name' and 'coords'. Ensure bus registration numbers start with 'KA'. All data should be realistic. If status is 'onroute', provide a plausible 'currentLocation' coordinate array [lat, lng]. Ensure startTime is on the specified date and endTime is the next day.`,
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
      
      // 2. Save new trips to "Database"
      const updatedAllTrips = [...currentDbTrips, ...generatedTrips];
      localStorage.setItem('ksrtc_trips', JSON.stringify(updatedAllTrips));
      setAllTrips(updatedAllTrips);
      
      // 3. Display results
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

  const handleSignUp = (name: string, email: string, pass: string) => {
    setAuthError(null);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setAuthError("An account with this email already exists.");
      return;
    }

    const newUser: StoredUser = {
      id: `user-${uuidv4()}`,
      name,
      email,
      password: pass
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('ksrtc_users', JSON.stringify(updatedUsers));
    
    // Automatically log in after sign up
    const appUser: User = { 
      id: newUser.id, 
      name: newUser.name, 
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${newUser.name}` 
    };
    
    setCurrentUser(appUser);
    setIsLoggedIn(true);
    setIsSignUpModalOpen(false);
    
    // If searching, stay there, otherwise go to bookings or home
    if (view !== 'SEARCH_RESULTS') {
        setView('HOME');
    }
  };

  const handleLogin = (email: string, pass: string) => {
    setAuthError(null);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user && user.password === pass) {
      setIsLoggedIn(true);
      setCurrentUser({ 
        id: user.id, 
        name: user.name, 
        avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}` 
      });
      setIsLoginModalOpen(false);
      if (view !== 'SEARCH_RESULTS') {
          setView('MY_BOOKINGS');
      }
    } else {
      setAuthError("Invalid email or password.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setView('HOME');
  };

  const openLogin = () => {
    setIsLoginModalOpen(true);
    setIsSignUpModalOpen(false);
    setAuthError(null);
  };

  const openSignUp = () => {
    setIsSignUpModalOpen(true);
    setIsLoginModalOpen(false);
    setAuthError(null);
  };
  
  const handleCancelBooking = (bookingId: string) => {
    setBookings(prevBookings => prevBookings.map(b => 
      b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
    ));
  };

  const handleConfirmBooking = async (trip: Trip, selectedSeats: Seat[]) => {
    if (!isLoggedIn) {
        setIsLoginModalOpen(true);
        return;
    }

    try {
        // 1. Update Local Database (Simulating Backend Update)
        const storedTripsJSON = localStorage.getItem('ksrtc_trips');
        const currentDbTrips: Trip[] = storedTripsJSON ? JSON.parse(storedTripsJSON) : [];
        
        const updatedTrip = { ...trip };
        
        // Update availability
        updatedTrip.seatsAvailable = Math.max(0, updatedTrip.seatsAvailable - selectedSeats.length);
        
        // Update specific seats status
        updatedTrip.bus.seatLayout.seats = updatedTrip.bus.seatLayout.seats.map(s => {
            if (selectedSeats.some(selected => selected.id === s.id)) {
                return { ...s, status: 'booked' };
            }
            return s;
        });
        updatedTrip.status = 'scheduled'; // Ensure it stays active

        // Save back to DB
        const updatedAllTrips = currentDbTrips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
        localStorage.setItem('ksrtc_trips', JSON.stringify(updatedAllTrips));
        setAllTrips(updatedAllTrips);

        // 2. Update View State
        setSearchResults(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));

        // 3. Create Booking Record
        const newBooking: Booking = {
            id: `BK-${uuidv4().slice(0, 8).toUpperCase()}`,
            tripId: trip.id,
            userId: currentUser?.id || 'user123',
            seats: selectedSeats.map(s => ({ seatId: s.id, price: trip.fare })),
            totalAmount: selectedSeats.length * trip.fare,
            status: 'CONFIRMED',
            createdAt: new Date().toISOString(),
        };

        setBookings(prev => [...prev, newBooking]);
        setLastBooking(newBooking);
        setView('CONFIRMATION');

    } catch (e) {
        console.error("Booking failed:", e);
        setError("An error occurred while confirming your booking. Please try again.");
    }
  };

  const renderView = () => {
    switch (view) {
      case 'HOME':
        return <HomePage onSearch={handleSearch} loading={loading} />;
      case 'SEARCH_RESULTS':
        return searchCriteria && (
            <SearchResultsPage 
                trips={searchResults} 
                searchCriteria={searchCriteria} 
                error={error}
                chatSession={chatSessionRef.current}
                onConfirmBooking={handleConfirmBooking}
                setLiveTrips={setSearchResults}
            />
        );
      case 'MY_BOOKINGS':
        return <MyBookingsPage bookings={bookings} trips={[...MOCK_TRIPS, ...searchResults]} onCancelBooking={handleCancelBooking} />;
      case 'CONFIRMATION':
        return lastBooking && <ConfirmationPage booking={lastBooking} onNavigateHome={() => setView('HOME')} />;
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
        onLoginClick={openLogin}
        onLogout={handleLogout}
      />
      {isLoginModalOpen && (
        <LoginModal 
            onLogin={handleLogin} 
            onClose={() => setIsLoginModalOpen(false)} 
            onSwitchToSignUp={openSignUp}
            authError={authError}
        />
      )}
      {isSignUpModalOpen && (
        <SignUpModal 
            onSignUp={handleSignUp} 
            onClose={() => setIsSignUpModalOpen(false)} 
            onSwitchToLogin={openLogin}
            authError={authError}
        />
      )}
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
