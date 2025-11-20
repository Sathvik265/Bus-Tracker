import React, { useState, useCallback, useEffect } from "react";
import { Trip, Booking, SearchCriteria, User, Seat } from "./types.ts";
import Header from "./components/Header";
import HomePage from "./components/pages/HomePage";
import SearchResultsPage from "./components/pages/SearchResultsPage";
import MyBookingsPage from "./components/pages/MyBookingsPage";
import ConfirmationPage from "./components/pages/ConfirmationPage";
import LoginModal from "./components/LoginModal";
import SignUpModal from "./components/SignUpModal";
import apiService from "./services/api";

type View = "HOME" | "SEARCH_RESULTS" | "MY_BOOKINGS" | "CONFIRMATION";

const App: React.FC = () => {
  const [view, setView] = useState<View>("HOME");
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(
    null
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchResults, setSearchResults] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleSearch = useCallback(async (criteria: SearchCriteria) => {
    setLoading(true);
    setError(null);
    setSearchCriteria(criteria);

    try {
      const response = await apiService.searchTrips(
        criteria.from,
        criteria.to,
        criteria.date
      );
      setSearchResults(response.trips || []);
      setView("SEARCH_RESULTS");
    } catch (e: unknown) {
      console.error("Search error:", e);
      setError(
        (e as any).response?.data?.message ||
          "Failed to fetch trips. Please try again."
      );
      setSearchResults([]);
      setView("SEARCH_RESULTS");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNavigate = useCallback(
    async (targetView: View) => {
      if (targetView === "MY_BOOKINGS" && !isLoggedIn) {
        setIsLoginModalOpen(true);
        return;
      }

      if (targetView === "MY_BOOKINGS" && isLoggedIn) {
        try {
          const response = await apiService.getUserBookings();
          setBookings(response.bookings || []);
        } catch (e: unknown) {
          console.error("Failed to fetch bookings:", e);
          setError("Failed to load your bookings");
        }
      }

      setView(targetView);
    },
    [isLoggedIn]
  );

  const handleSignUp = async (
    name: string,
    email: string,
    password: string
  ) => {
    setAuthError(null);
    try {
      const response = await apiService.register(name, email, password);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setCurrentUser(response.user);
      setIsLoggedIn(true);
      setIsSignUpModalOpen(false);

      if (view !== "SEARCH_RESULTS") {
        setView("HOME");
      }
    } catch (e: unknown) {
      setAuthError(
        (e as any).response?.data?.message ||
          "Sign up failed. Please try again."
      );
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const response = await apiService.login(email, password);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setCurrentUser(response.user);
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);

      if (view !== "SEARCH_RESULTS") {
        setView("MY_BOOKINGS");
      }
    } catch (e: unknown) {
      setAuthError(
        (e as any).response?.data?.message || "Invalid email or password."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setView("HOME");
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

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await apiService.cancelBooking(bookingId);
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.id === bookingId ? { ...b, status: "CANCELLED" } : b
        )
      );
    } catch (e: unknown) {
      console.error("Cancel booking error:", e);
      setError("Failed to cancel booking");
    }
  };

  const handleConfirmBooking = async (trip: Trip, selectedSeats: Seat[]) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const seats = selectedSeats.map((s) => ({
        seatId: s.id,
        price: trip.fare,
      }));
      const response = await apiService.createBooking(trip.id, seats);

      setLastBooking(response.booking);

      // Update search results to reflect booked seats
      setSearchResults((prev) =>
        prev.map((t) => {
          if (t.id === trip.id) {
            const updatedSeats = t.bus.seatLayout.seats.map((seat) => {
              if (selectedSeats.some((s) => s.id === seat.id)) {
                return { ...seat, status: "booked" as any };
              }
              return seat;
            });

            return {
              ...t,
              bus: {
                ...t.bus,
                seatLayout: {
                  ...t.bus.seatLayout,
                  seats: updatedSeats,
                },
              },
              seatsAvailable: Math.max(
                0,
                t.seatsAvailable - selectedSeats.length
              ),
            };
          }
          return t;
        })
      );

      setView("CONFIRMATION");
    } catch (e: unknown) {
      console.error("Booking error:", e);
      setError(
        (e as any).response?.data?.message ||
          "Failed to complete booking. Please try again."
      );
    }
  };

  const renderView = () => {
    switch (view) {
      case "HOME":
        return <HomePage onSearch={handleSearch} loading={loading} />;
      case "SEARCH_RESULTS":
        return (
          searchCriteria && (
            <SearchResultsPage
              trips={searchResults}
              searchCriteria={searchCriteria}
              error={error}
              onConfirmBooking={handleConfirmBooking}
              setLiveTrips={setSearchResults}
            />
          )
        );
      case "MY_BOOKINGS":
        return (
          <MyBookingsPage
            bookings={bookings}
            trips={searchResults}
            onCancelBooking={handleCancelBooking}
          />
        );
      case "CONFIRMATION":
        return (
          lastBooking && (
            <ConfirmationPage
              booking={lastBooking}
              onNavigateHome={() => setView("HOME")}
            />
          )
        );
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
