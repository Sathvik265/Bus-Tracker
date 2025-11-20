export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface SearchCriteria {
  from: string;
  to: string;
  date: string;
}

export interface Seat {
  id: string;
  seatNumber: string;
  status: "available" | "booked" | "blocked";
  isWindow: boolean;
}

export interface SeatLayout {
  rows: number;
  cols: number;
  seats: Seat[];
}

export interface Bus {
  id: string;
  busNumber: string;
  capacity: number;
  busType: "AC" | "Non-AC" | "Sleeper";
  seatLayout: SeatLayout;
}

export interface Trip {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  bus: Bus;
  fare: number;
  seatsAvailable: number;
}

export interface Booking {
  id: string;
  user: User;
  trip: Trip;
  seats: Seat[];
  totalAmount: number;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  bookingDate: string;
}
