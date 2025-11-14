import { Trip, Booking, Route, Bus, Seat } from './types';

const createSeatLayout = (rows: number, cols: number, sleeper: boolean = false): Seat[] => {
    const seats: Seat[] = [];
    let seatNum = 1;
    for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
            if (cols === 5 && (c === 3)) continue; // Aisle
            if (sleeper && cols === 3 && c === 2) continue; // Aisle for sleeper

            const isLadies = r <= 2 && seatNum <= 8;
            seats.push({
                id: `${sleeper ? 'S' : 'A'}${seatNum}`,
                label: `${sleeper ? 'S' : ''}${seatNum}`,
                status: Math.random() > 0.6 ? 'booked' : isLadies ? 'ladies' : 'available',
                type: sleeper ? 'sleeper' : 'seater',
                isLadies: isLadies,
            });
            seatNum++;
        }
    }
    return seats;
};


// Routes in Karnataka
const ROUTES: Route[] = [
    { id: 'R01', origin: { name: 'Hubli', coords: [15.3592, 75.1240] }, destination: { name: 'Bengaluru', coords: [12.9716, 77.5946] }, stops: [{ name: 'Davanagere', coords: [14.4645, 75.9218] }, { name: 'Chitradurga', coords: [14.2251, 76.3982] }, { name: 'Tumakuru', coords: [13.3426, 77.1017] }], distanceKm: 411 },
    { id: 'R02', origin: { name: 'Dharwad', coords: [15.4589, 75.0078] }, destination: { name: 'Mysuru', coords: [12.2958, 76.6394] }, stops: [{ name: 'Hassan', coords: [13.0033, 76.1004] }, { name: 'Channarayapatna', coords: [12.9036, 76.3899] }], distanceKm: 480 },
    { id: 'R03', origin: { name: 'Bengaluru', coords: [12.9716, 77.5946] }, destination: { name: 'Hubli', coords: [15.3592, 75.1240] }, stops: [{ name: 'Tumakuru', coords: [13.3426, 77.1017] }, { name: 'Chitradurga', coords: [14.2251, 76.3982] }, { name: 'Davanagere', coords: [14.4645, 75.9218] }], distanceKm: 411 },
    { id: 'R04', origin: { name: 'Mangaluru', coords: [12.9141, 74.8560] }, destination: { name: 'Bengaluru', coords: [12.9716, 77.5946] }, stops: [{ name: 'Sakleshpura', coords: [12.9698, 75.7834] }, { name: 'Hassan', coords: [13.0033, 76.1004] }], distanceKm: 352 },
];

// Buses
const BUSES: Bus[] = [
    { id: 'B01', registrationNumber: 'KA-19-F-3456', capacity: 45, seatLayout: { rows: 12, cols: 5, seats: createSeatLayout(12, 5) }, operator: 'KSRTC', type: 'Volvo Multi-Axle' },
    { id: 'B02', registrationNumber: 'KA-25-G-7890', capacity: 30, seatLayout: { rows: 10, cols: 3, seats: createSeatLayout(10, 3, true) }, operator: 'KSRTC', type: 'AC Sleeper' },
    { id: 'B03', registrationNumber: 'KA-01-H-1234', capacity: 52, seatLayout: { rows: 13, cols: 5, seats: createSeatLayout(13, 5) }, operator: 'KSRTC', type: 'Non-AC Seater' },
];

// Helper to create dates for mock data
const createDate = (dayOffset: number, hour: number, minute: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
}

// Mock Trips
export const MOCK_TRIPS: Trip[] = [
    {
        id: 'T01',
        routeId: 'R01',
        busId: 'B01',
        startTime: createDate(0, 21, 30), // Today 9:30 PM
        endTime: createDate(1, 5, 0),    // Tomorrow 5:00 AM
        fare: 750,
        status: 'onroute',
        seatsAvailable: BUSES[0].seatLayout.seats.filter(s => s.status !== 'booked').length,
        route: ROUTES[0],
        bus: BUSES[0],
        currentLocation: [14.5, 76.0] // Simulated location between Hubli and Bengaluru
    },
    {
        id: 'T02',
        routeId: 'R02',
        busId: 'B02',
        startTime: createDate(0, 22, 0), // Today 10:00 PM
        endTime: createDate(1, 6, 30),   // Tomorrow 6:30 AM
        fare: 1100,
        status: 'scheduled',
        seatsAvailable: BUSES[1].seatLayout.seats.filter(s => s.status !== 'booked').length,
        route: ROUTES[1],
        bus: BUSES[1],
    },
    {
        id: 'T03',
        routeId: 'R03',
        busId: 'B03',
        startTime: createDate(0, 22, 15), // Today 10:15 PM
        endTime: createDate(1, 5, 45),    // Tomorrow 5:45 AM
        fare: 550,
        status: 'scheduled',
        seatsAvailable: BUSES[2].seatLayout.seats.filter(s => s.status !== 'booked').length,
        route: ROUTES[2],
        bus: BUSES[2],
    },
     {
        id: 'T04',
        routeId: 'R01',
        busId: 'B02',
        startTime: createDate(0, 23, 0),  // Today 11:00 PM
        endTime: createDate(1, 6, 0),     // Tomorrow 6:00 AM
        fare: 1200,
        status: 'onroute',
        seatsAvailable: BUSES[1].seatLayout.seats.filter(s => s.status !== 'booked').length,
        route: ROUTES[0],
        bus: BUSES[1],
        currentLocation: [13.8, 76.5]
    },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BK01',
    tripId: 'T01',
    userId: 'user123',
    seats: [
      { seatId: 'A5', price: 750 },
      { seatId: 'A6', price: 750 },
    ],
    totalAmount: 1500,
    status: 'CONFIRMED',
    createdAt: new Date(new Date().setDate(new Date().getDate()-1)).toISOString(),
  }
];

export const LOCATIONS = [
    'Bengaluru', 'Mysuru', 'Hubli', 'Dharwad', 'Mangaluru', 'Belagavi', 
    'Ballari', 'Bidar', 'Chitradurga', 'Davanagere', 'Gadag', 
    'Hassan', 'Haveri', 'Kalaburagi', 'Kolar', 'Koppal', 'Mandya', 
    'Raichur', 'Shivamogga', 'Tumakuru', 'Udupi', 'Vijayapura', 'Yadgir'
];