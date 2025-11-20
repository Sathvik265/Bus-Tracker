import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }
    
    const token = authHeader.substring(7);
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const decoded = jwt.verify(token, jwtSecret) as { 
      id: string; 
      email: string;
      name: string;
    };
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token expired' });
    } else {
      res.status(500).json({ message: 'Authentication failed' });
    }
  }
};
