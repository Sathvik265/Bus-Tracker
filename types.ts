export type SeatStatus = 'available' | 'booked' | 'ladies' | 'selected';
export type SeatType = 'seater' | 'sleeper';

export interface Seat {
  id: string;
  label: string;
  status: SeatStatus;
  type: SeatType;
  isLadies?: boolean;
}

export interface SeatLayout {
  rows: number;
  cols: number;
  seats: Seat[];
}

export interface Bus {
  id: string;
  registrationNumber: string;
  capacity: number;
  seatLayout: SeatLayout;
  operator: string;
  type: 'Non-AC Seater' | 'AC Sleeper' | 'Volvo Multi-Axle';
}

export interface Route {
  id: string;
  origin: { name: string; coords: [number, number] };
  destination: { name: string; coords: [number, number] };
  stops: { name: string; coords: [number, number] }[];
  distanceKm: number;
}

export interface Trip {
  id: string;
  routeId: string;
  busId: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  fare: number;
  status: 'scheduled' | 'onroute' | 'completed' | 'cancelled';
  seatsAvailable: number;
  route: Route;
  bus: Bus;
  currentLocation?: [number, number]; // [lat, lng]
}

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  seats: { seatId: string; price: number }[];
  totalAmount: number;
  status: 'HOLD' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string; // ISO 8601 format
}

export interface SearchCriteria {
    from: string;
    to: string;
    date: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}
