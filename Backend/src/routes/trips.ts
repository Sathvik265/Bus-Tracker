import { Router, Request, Response } from 'express';
import { 
  searchTrips, 
  getTripById, 
  createTrip, 
  updateTrip,
  updateSeatStatus 
} from '../controllers/tripController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public test route — must be before param routes
router.get('/test', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    route: '/api/trips/test',
    message: 'Trips router reachable (no auth).',
    sampleResponse: [
      { id: 'trip1', from: 'A', to: 'B', seats: 40 },
      { id: 'trip2', from: 'C', to: 'D', seats: 30 }
    ]
  });
});

// Non-param routes
router.get('/search', searchTrips);

// Parameter route must come after the static /test route
router.get('/:tripId', getTripById);

// Protected routes
router.post('/', authenticate, createTrip);
router.put('/:tripId', authenticate, updateTrip);
router.patch('/:tripId/seats', authenticate, updateSeatStatus);

export default router;
