import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBooking extends Document {
  tripId: Types.ObjectId;
  userId: Types.ObjectId;
  seats: { seatId: string; price: number }[];
  totalAmount: number;
  status: 'HOLD' | 'CONFIRMED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  seats: [{
    seatId: { 
      type: String, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true,
      min: [0, 'Price must be positive']
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount must be positive']
  },
  status: {
    type: String,
    enum: ['HOLD', 'CONFIRMED', 'CANCELLED'],
    default: 'CONFIRMED',
    index: true
  }
}, {
  timestamps: true
});

// Compound index for user bookings
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ tripId: 1, status: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
