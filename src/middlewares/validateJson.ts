import { Request, Response, NextFunction } from 'express';
import { response } from '../utils/response';

export const validateJson = (err: any, req: Request, res: Response, next: NextFunction) => {
  if(err instanceof SyntaxError && 'body' in err){
    return response(res, false, 400, "Invalid JSON format");
  }
  
  next();
};