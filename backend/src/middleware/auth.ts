import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.auth || '';
  if (token) {
    const payload = verifyAuthToken(token);
    if (payload) {
      req.user = { userId: payload.userId, email: payload.email } as Express.User;
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.auth || '';
  const payload = token ? verifyAuthToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = { userId: payload.userId, email: payload.email } as Express.User;
  next();
}


