import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { Request, Response } from 'express';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
// Add this near the bottom of Backend/src/routes/auth.ts, before `export default router;`
router.get('/test', (_req: Request, res: Response) => {
  // return basic info about auth routes for smoke testing
  res.json({
    ok: true,
    route: '/api/auth/test',
    message: 'Auth routes reachable (no auth required for this test).',
    availableEndpoints: [
      '/api/auth/login (POST)',
      '/api/auth/register (POST)'
    ]
  });
});


export default router;
