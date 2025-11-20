import { Router } from 'express';
import { 
  searchTrips, 
  getTripById, 
  createTrip, 
  updateTrip,
  updateSeatStatus 
} from '../controllers/tripController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/search', searchTrips);
router.get('/:tripId', getTripById);
router.post('/', authenticate, createTrip);
router.put('/:tripId', authenticate, updateTrip);
router.patch('/:tripId/seats', authenticate, updateSeatStatus);

export default router;
