import { Request, Response, NextFunction } from 'express';

export default (requiredPermission: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        throw new Error('Unauthorized');
      }

      const userId = req.user._id;

      if (!userId) {
        throw new Error('Unauthorized');
      }

      const user = await User.findById(userId).populate('roles');
      if (!user) {
        throw new Error('User not found');
      }

      const permissions = user.roles.flatMap((role: any) => role.permissions);

      //if super admin, allow all permissions
      if (permissions.includes('all')) {
        return next();
      }

      if (permissions.includes(requiredPermission)) {
        return next();
      } else {
        throw new Error('You do not have permission to access this resource');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Permission error:', error.message); // Log the error for debugging
        res.status(403).json({
          message: error.message,
        });
      }
    }
  };
};
