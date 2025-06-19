import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as JwtPayload;

    if (!decoded) {
      throw new Error('Invalid token');
    }

    req.user = { _id: decoded._id, roles: decoded.roles }; // Set user property with roles

    next();
  } catch (error) {
    const message =
      error instanceof jwt.TokenExpiredError
        ? 'Token expired, please login again'
        : error instanceof jwt.JsonWebTokenError
        ? 'Invalid token, please login again'
        : error instanceof jwt.NotBeforeError
        ? 'Token not active yet, please wait'
        : error instanceof Error
        ? error.message
        : 'Unauthorized';

    res.status(401).json({ message });
  }
};
