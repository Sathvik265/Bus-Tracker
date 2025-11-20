import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Trip from '../models/Trip';
import { AuthRequest } from '../middleware/auth';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { tripId, seats } = req.body;
    
    if (!tripId || !seats || !Array.isArray(seats) || seats.length === 0) {
      res.status(400).json({ message: 'tripId and seats array are required' });
      return;
    }
    
    // Get trip
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }
    
    // Check seat availability
    const seatIds = seats.map(s => s.seatId);
    const tripSeats = trip.bus.seatLayout.seats;
    
    for (const seatId of seatIds) {
      const seat = tripSeats.find(s => s.id === seatId);
      if (!seat) {
        res.status(400).json({ message: `Seat ${seatId} not found` });
        return;
      }
      if (seat.status === 'booked') {
        res.status(400).json({ message: `Seat ${seatId} is already booked` });
        return;
      }
    }
    
    // Calculate total
    const totalAmount = seats.reduce((sum, s) => sum + s.price, 0);
    
    // Create booking
    const booking = await Booking.create({
      tripId,
      userId,
      seats,
      totalAmount,
      status: 'CONFIRMED'
    });
    
    // Update seat statuses in trip
    trip.bus.seatLayout.seats = tripSeats.map(seat => {
      if (seatIds.includes(seat.id)) {
        return { ...seat, status: 'booked' as any };
      }
      return seat;
    });
    
    trip.seatsAvailable = Math.max(0, trip.seatsAvailable - seats.length);
    await trip.save();
    
    // Populate booking with trip details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('tripId')
      .populate('userId', 'name email');
    
    res.status(201).json({ booking: populatedBooking });
  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    const bookings = await Booking.find({ userId })
      .populate('tripId')
      .sort({ createdAt: -1 });
    
    res.json({ bookings, count: bookings.length });
  } catch (error: any) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Failed to get bookings', error: error.message });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const userId = req.user!.id;
    
    const booking = await Booking.findOne({ _id: bookingId, userId })
      .populate('tripId')
      .populate('userId', 'name email');
    
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    
    res.json({ booking });
  } catch (error: any) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Failed to get booking', error: error.message });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const userId = req.user!.id;
    
    const booking = await Booking.findOne({ _id: bookingId, userId });
    
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    
    if (booking.status === 'CANCELLED') {
      res.status(400).json({ message: 'Booking is already cancelled' });
      return;
    }
    
    // Update booking status
    booking.status = 'CANCELLED';
    await booking.save();
    
    // Release seats in trip
    const trip = await Trip.findById(booking.tripId);
    if (trip) {
      const seatIds = booking.seats.map(s => s.seatId);
      
      trip.bus.seatLayout.seats = trip.bus.seatLayout.seats.map(seat => {
        if (seatIds.includes(seat.id)) {
          return { ...seat, status: 'available' as any };
        }
        return seat;
      });
      
      trip.seatsAvailable += booking.seats.length;
      await trip.save();
    }
    
    res.json({ booking, message: 'Booking cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
  }
};
