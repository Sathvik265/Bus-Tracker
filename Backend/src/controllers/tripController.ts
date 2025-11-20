import { Request, Response } from 'express';
import Trip from '../models/Trip';

export const searchTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to, date } = req.query;
    
    if (!from || !to || !date) {
      res.status(400).json({ message: 'From, to, and date are required' });
      return;
    }
    
    // Parse date (YYYY-MM-DD)
    const searchDate = new Date(date as string);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const trips = await Trip.find({
      'route.origin.name': new RegExp(`^${from}$`, 'i'),
      'route.destination.name': new RegExp(`^${to}$`, 'i'),
      startTime: {
        $gte: searchDate,
        $lt: nextDay
      },
      status: { $in: ['scheduled', 'onroute'] }
    }).sort({ startTime: 1 });
    
    res.json({ trips, count: trips.length });
  } catch (error: any) {
    console.error('Search trips error:', error);
    res.status(500).json({ message: 'Failed to search trips', error: error.message });
  }
};

export const getTripById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }
    
    res.json({ trip });
  } catch (error: any) {
    console.error('Get trip error:', error);
    res.status(500).json({ message: 'Failed to get trip', error: error.message });
  }
};

export const createTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const tripData = req.body;
    
    const trip = await Trip.create(tripData);
    
    res.status(201).json({ trip });
  } catch (error: any) {
    console.error('Create trip error:', error);
    res.status(500).json({ message: 'Failed to create trip', error: error.message });
  }
};

export const updateTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const updates = req.body;
    
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }
    
    res.json({ trip });
  } catch (error: any) {
    console.error('Update trip error:', error);
    res.status(500).json({ message: 'Failed to update trip', error: error.message });
  }
};

export const updateSeatStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const { seatIds, status } = req.body;
    
    if (!seatIds || !Array.isArray(seatIds) || !status) {
      res.status(400).json({ message: 'seatIds (array) and status are required' });
      return;
    }
    
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }
    
    // Update seat statuses
    trip.bus.seatLayout.seats = trip.bus.seatLayout.seats.map(seat => {
      if (seatIds.includes(seat.id)) {
        return { ...seat, status };
      }
      return seat;
    });
    
    // Update available seats count
    const availableSeats = trip.bus.seatLayout.seats.filter(
      s => s.status === 'available'
    ).length;
    trip.seatsAvailable = availableSeats;
    
    await trip.save();
    
    res.json({ trip });
  } catch (error: any) {
    console.error('Update seat status error:', error);
    res.status(500).json({ message: 'Failed to update seat status', error: error.message });
  }
};
