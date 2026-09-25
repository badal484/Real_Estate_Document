import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, createError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { signInWithGoogle } from '../../services/auth.service.js';

const router = Router();

const GoogleSignInSchema = z.object({
  credential: z.string().min(1),
});

// POST /api/auth/google — exchange a Google ID token for a session JWT
router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const parsed = GoogleSignInSchema.safeParse(req.body);
    if (!parsed.success) throw createError('Missing Google credential', 400);

    const session = await signInWithGoogle(parsed.data.credential);
    res.json(session);
  }),
);

// GET /api/auth/me — return the signed-in user
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
