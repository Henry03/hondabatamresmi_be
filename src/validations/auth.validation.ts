import { body } from 'express-validator';

export const registerValidation = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),

    body('username')
        .notEmpty().withMessage('Username is required')
        .isString().withMessage('Username must be a string'),

    body('verificationCode')
        .notEmpty().withMessage('Code is required')
        .isString().withMessage('Code must be a string'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('passwordConfirmation')
        .notEmpty().withMessage('Password confirmation is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
];

export const loginValidation = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isString().withMessage('Username must be a string'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
