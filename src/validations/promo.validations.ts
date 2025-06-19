import { NextFunction, Request, Response } from 'express';
import { body, check } from 'express-validator';

export const promoValidation = [
    body('name')
        .notEmpty().withMessage('Promos name is required'),

    body('slug')
        .notEmpty().withMessage('Slug is required'),

    body('startDate')
        .notEmpty().withMessage('Start date is required'),

    body('endDate')
        .notEmpty().withMessage('End date is required'),

    body('page')
        .notEmpty().withMessage('Page is required')
        .custom((value) => {
            const stripped = value.replace(/<(.|\n)*?>/g, '').trim(); // Remove all HTML tags
            if (!stripped) {
            throw new Error('Page is required');
            }
            return true;
        }),

    body('isGlobal')
        .notEmpty().withMessage('Is Global is required')
        .isBoolean().withMessage('Value must boolean'),
        
    body('cars')
        .custom((value, { req }) => {
            if (req.body.isGlobal === false || req.body.isGlobal === 'false') {
                if (!Array.isArray(value) || value.length === 0) {
                throw new Error('Cars is required');
                }
            }
            return true;
        }),

    // check('media')
    //     .custom((_, { req }) => {
    //         const file = req.file;
    //         if (!file || file.length === 0) {
    //             throw new Error('At least one media file is required');
    //         }

    //         const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
    //         if (!allowedTypes.includes(file.mimetype)) {
    //         throw new Error(`Unsupported file type: ${file.originalname}`);
    //         }

    //         const maxSize = 10 * 1024 * 1024;
    //         if (file.size > maxSize) {
    //         throw new Error(`File too large: ${file.originalname}`);
    //         }

    //         return true;
    //     }),
]

export const updateCarValidation = [
    body('id')
        .notEmpty().withMessage('ID is required'),
        
    body('name')
        .notEmpty().withMessage('Name of car is required'),

    body('description')
        .notEmpty().withMessage('Description is required'),

    body('page')
        .notEmpty().withMessage('Page is required'),

    body('tags')
        .notEmpty().withMessage('Tags is required')
        .isArray().withMessage('Tags must be an array'),
    
    body('variants')
        .isArray({ min: 1 }).withMessage('Variants must be a non-empty array'),

    body('variants.*.name')
        .notEmpty().withMessage('Type is required'),

    body('variants.*.price')
        .notEmpty().withMessage('Each variant must have a price')
        .isNumeric().withMessage('Price must be numeric')
        .isInt({min: 1}).withMessage('Price must more than 0'),
]