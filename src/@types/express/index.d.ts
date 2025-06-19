//declare global interface for request
import { Request } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user: { _id: string; roles: string[] }; // Menambahkan properti user pada Request
    }
  }
}
