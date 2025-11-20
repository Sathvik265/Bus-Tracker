import { Router } from 'express';
import { 
  searchTrips, 
  getTripById, 
  createTrip, 
  updateTrip,
  updateSeatStatus 
} from '../controllers/tripController';
import { authenticate } from '../middleware/auth';
import { Request, Response } from 'express';

const router = Router();

router.get('/search', searchTrips);
router.get('/:tripId', getTripById);
router.post('/', authenticate, createTrip);
router.put('/:tripId', authenticate, updateTrip);
router.patch('/:tripId/seats', authenticate, updateSeatStatus);
// Add this near the bottom of Backend/src/routes/trips.ts, before `export default router;`
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


export default router;
