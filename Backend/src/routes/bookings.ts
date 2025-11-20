// Backend/src/routes/bookings.ts
import { Router, Request, Response } from 'express';
import { 
  createBooking, 
  getUserBookings, 
  getBookingById,
  cancelBooking 
} from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public test route — must come BEFORE the auth middleware
router.get('/test', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    route: '/api/bookings/test',
    message: 'Bookings router reachable (test route does not require auth).',
    sampleResponse: [
      { id: 'booking1', tripId: 'trip1', user: 'demo@example.com' },
      { id: 'booking2', tripId: 'trip2', user: 'demo2@example.com' }
    ]
  });
});

// Apply authentication for all routes below
router.use(authenticate);

// Protected booking routes
router.post('/', createBooking);
router.get('/user', getUserBookings);
router.get('/:bookingId', getBookingById);
router.patch('/:bookingId/cancel', cancelBooking);

export default router;
