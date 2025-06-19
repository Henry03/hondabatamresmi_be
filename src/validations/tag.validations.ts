import { body, param } from 'express-validator';

export const getAllTagsValidation = [
    body('page')
        .notEmpty().withMessage('Page is required'),
    
    body('pageSize')
        .notEmpty().withMessage('Page size is required'),

    body('sortBy')
        .notEmpty().withMessage('Sort by is required'),
    
    body('sortOrder')
        .notEmpty().withMessage('Sort order is required')
]

export const createTagValidation = [
    body('name')
        .notEmpty().withMessage('Name of tag is required'),

    body('slug')
        .notEmpty().withMessage('Slug is required')
        .isString().withMessage('Slug must be a string'),
]

export const updateTagValidation = [
    body('id')
        .notEmpty().withMessage('ID is required'),

    body('name')
        .notEmpty().withMessage('Name is required'),

    body('slug')
        .notEmpty().withMessage('Slug is required')
        .isString().withMessage('Slug must be a string'),
]

export const deleteTagValidation = [
    param('id')
        .notEmpty().withMessage('ID of tag is required')
]