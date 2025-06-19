import { Router } from 'express';
import * as tagController from '../controllers/tag.controller';
import AuthenticateJWT from '../middlewares/authenticateJWT';
import { validateRequest } from '../middlewares/validateRequest';
import { createTagValidation, deleteTagValidation, getAllTagsValidation, updateTagValidation } from '../validations/tag.validations';

const router = Router();

router.get('/', tagController.getAll);

router.use(AuthenticateJWT);

router.post('/', getAllTagsValidation, validateRequest, tagController.getAllWithPagination);
router.post('/create', createTagValidation, validateRequest, tagController.create);
router.put('/', updateTagValidation, validateRequest, tagController.update);
router.delete('/:id', deleteTagValidation, validateRequest, tagController.destroy);

export default router;
