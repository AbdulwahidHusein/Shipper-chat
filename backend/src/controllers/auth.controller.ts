import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { generateToken } from '../services/auth.service';
import { updateUser } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/responses';

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  passport.authenticate('google', { session: false }, async (err: Error, user: any) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    try {
      // Update user online status
      await updateUser(user.id, {
        isOnline: true,
        lastSeen: new Date(),
      });

      // Generate JWT token
      const token = generateToken(user);

      // Set token in httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true, // Always true for HTTPS (Cloud Run uses HTTPS)
        sameSite: 'none', // Required for cross-origin cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/', // Ensure cookie is available for all paths
        domain: undefined, // Let browser set domain automatically
      });

      // Redirect to frontend
      res.redirect(`${process.env.FRONTEND_URL}/?auth=success`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  })(req, res, next);
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
    return;
  }

  const { id, email, name, picture, isOnline, lastSeen } = req.user;
  sendSuccess(res, {
    id,
    email,
    name,
    picture,
    isOnline,
    lastSeen,
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  if (req.user) {
    try {
      await updateUser(req.user.id, {
        isOnline: false,
        lastSeen: new Date(),
      });
    } catch (error) {
      console.error('Error updating user on logout:', error);
    }
  }

  res.clearCookie('token');
  sendSuccess(res, null, 'Logged out successfully');
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
    return;
  }

  const token = generateToken(req.user);

  res.cookie('token', token, {
    httpOnly: true,
    secure: true, // Always true for HTTPS
    sameSite: 'none', // Required for cross-origin cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  sendSuccess(res, null, 'Token refreshed successfully');
};
