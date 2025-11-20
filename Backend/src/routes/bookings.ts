import { Router } from 'express';
import { 
  createBooking, 
  getUserBookings, 
  getBookingById,
  cancelBooking 
} from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', createBooking);
router.get('/user', getUserBookings);
router.get('/:bookingId', getBookingById);
router.patch('/:bookingId/cancel', cancelBooking);

export default router;
