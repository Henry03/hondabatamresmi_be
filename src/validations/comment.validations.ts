import { NextFunction, Request, Response } from 'express';
import { body, check } from 'express-validator';

export const commentValidation = [
    body('name')
        .notEmpty().withMessage('Commenter name is required'),

    body('carId')
        .notEmpty().withMessage('Car is required'),

    body('message')
        .notEmpty().withMessage('Message is required'),

]