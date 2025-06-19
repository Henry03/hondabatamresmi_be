import { NextFunction, Request, Response } from 'express';
import { body, check } from 'express-validator';

export const createCarValidation = [
    body('name')
        .notEmpty().withMessage('Name of car is required'),

    body('description')
        .notEmpty().withMessage('Description is required'),

    body('slug')
        .notEmpty().withMessage('Slug is required'),

    body('page')
        .notEmpty().withMessage('Page is required')
        .custom((value) => {
            const stripped = value.replace(/<(.|\n)*?>/g, '').trim(); // Remove all HTML tags
            if (!stripped) {
            throw new Error('Page is required');
            }
            return true;
        }),

    body('tags')
        .notEmpty().withMessage('Tags is required')
        .isArray().withMessage('Tags must be an array'),

    check('media')
        .custom((_, { req }) => {
        const files = req.files;
            if (!files || files.length === 0) {
                throw new Error('At least one media file is required');
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
            for (const file of files) {
                if (!allowedTypes.includes(file.mimetype)) {
                throw new Error(`Unsupported file type: ${file.originalname}`);
                }
            }

            const maxSize = 10 * 1024 * 1024;
            for (const file of files) {
                if (file.size > maxSize) {
                throw new Error(`File too large: ${file.originalname}`);
                }
            }

            return true;
        }),
    
    body('variants')
        .isArray({ min: 1 }).withMessage('Variants must be a non-empty array'),

    body('variants.*.name')
        .notEmpty().withMessage('Type is required'),

    body('variants.*.price')
        .notEmpty().withMessage('Each variant must have a price')
        .isNumeric().withMessage('Price must be numeric')
        .isInt({min: 1}).withMessage('Price must more than 0'),
]

export const updateCarValidation = [
    body('id')
        .notEmpty().withMessage('ID is required'),
        
    body('name')
        .notEmpty().withMessage('Name of car is required'),

    body('slug')
        .notEmpty().withMessage('Slug is required'),

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