import { body, param } from "express-validator";

export const getPaginatedDataValidation = [
    body('page')
        .notEmpty().withMessage('Page is required'),
    
    body('pageSize')
        .notEmpty().withMessage('Page size is required'),

    body('sortBy')
        .notEmpty().withMessage('Sort by is required'),
    
    body('sortOrder')
        .notEmpty().withMessage('Sort order is required')
]

export const deleteItemValidation = [
    param('id')
        .notEmpty().withMessage('ID is required')
]

export const slugParamItemValidation = [
    param('slug')
        .notEmpty().withMessage('Slug is required')
]

export const idItemValidation = [
    param('id')
        .notEmpty().withMessage('ID is required')
]

export const idBodyItemValidation = [
    body('id')
        .notEmpty().withMessage('ID is required')
]