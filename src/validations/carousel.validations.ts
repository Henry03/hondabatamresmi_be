import { NextFunction, Request, Response } from 'express';
import { body, check } from 'express-validator';

export const carouselValidation = [
    body('name')
        .notEmpty().withMessage('Name of car is required'),

    body('link')
        .notEmpty().withMessage('Link is required')
]