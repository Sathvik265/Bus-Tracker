import mongoose, { Document, Schema } from 'mongoose';

interface ISeat {
  id: string;
  label: string;
  status: 'available' | 'booked' | 'ladies' | 'selected';
  type: 'seater' | 'sleeper';
  isLadies?: boolean;
}

interface ISeatLayout {
  rows: number;
  cols: number;
  seats: ISeat[];
}

interface IBus {
  id: string;
  registrationNumber: string;
  capacity: number;
  seatLayout: ISeatLayout;
  operator: string;
  type: 'Non-AC Seater' | 'AC Sleeper' | 'Volvo Multi-Axle';
}

interface IRoute {
  id: string;
  origin: { name: string; coords: [number, number] };
  destination: { name: string; coords: [number, number] };
  stops: { name: string; coords: [number, number] }[];
  distanceKm: number;
}

export interface ITrip extends Document {
  routeId: string;
  busId: string;
  startTime: Date;
  endTime: Date;
  fare: number;
  status: 'scheduled' | 'onroute' | 'completed' | 'cancelled';
  seatsAvailable: number;
  route: IRoute;
  bus: IBus;
  currentLocation?: [number, number];
  createdAt: Date;
  updatedAt: Date;
}

const SeatSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['available', 'booked', 'ladies', 'selected'],
    default: 'available'
  },
  type: { 
    type: String, 
    enum: ['seater', 'sleeper'],
    required: true
  },
  isLadies: { type: Boolean, default: false }
}, { _id: false });

const SeatLayoutSchema = new Schema({
  rows: { type: Number, required: true },
  cols: { type: Number, required: true },
  seats: [SeatSchema]
}, { _id: false });

const BusSchema = new Schema({
  id: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
  seatLayout: SeatLayoutSchema,
  operator: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Non-AC Seater', 'AC Sleeper', 'Volvo Multi-Axle'],
    required: true
  }
}, { _id: false });

const LocationSchema = new Schema({
  name: { type: String, required: true },
  coords: { 
    type: [Number], 
    required: true,
    validate: {
      validator: (v: number[]) => v.length === 2,
      message: 'Coordinates must be [latitude, longitude]'
    }
  }
}, { _id: false });

const RouteSchema = new Schema({
  id: { type: String, required: true },
  origin: LocationSchema,
  destination: LocationSchema,
  stops: [LocationSchema],
  distanceKm: { type: Number, required: true }
}, { _id: false });

const TripSchema = new Schema<ITrip>({
  routeId: { 
    type: String, 
    required: true,
    index: true
  },
  busId: { 
    type: String, 
    required: true,
    index: true
  },
  startTime: { 
    type: Date, 
    required: true,
    index: true
  },
  endTime: { 
    type: Date, 
    required: true
  },
  fare: { 
    type: Number, 
    required: true,
    min: [0, 'Fare must be positive']
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'onroute', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  seatsAvailable: { 
    type: Number, 
    required: true,
    min: [0, 'Seats available cannot be negative']
  },
  route: RouteSchema,
  bus: BusSchema,
  currentLocation: {
    type: [Number],
    validate: {
      validator: function(v: number[] | undefined) {
        return !v || v.length === 2;
      },
      message: 'Current location must be [latitude, longitude]'
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
TripSchema.index({ 'route.origin.name': 1, 'route.destination.name': 1, startTime: 1 });
TripSchema.index({ status: 1, startTime: 1 });

export default mongoose.model<ITrip>('Trip', TripSchema);
