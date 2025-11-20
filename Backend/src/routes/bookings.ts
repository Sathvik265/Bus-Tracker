import { Router } from 'express';
import { 
  createBooking, 
  getUserBookings, 
  getBookingById,
  cancelBooking 
} from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';
import { Request, Response } from 'express';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', createBooking);
router.get('/user', getUserBookings);
router.get('/:bookingId', getBookingById);
router.patch('/:bookingId/cancel', cancelBooking);
// Add this near the bottom of Backend/src/routes/bookings.ts, before `export default router;`
// If your router applies auth middleware globally, put this route above that middleware section.
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


export default router;
