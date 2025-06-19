import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { loginValidation, registerValidation } from '../validations/auth.validation';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

router.post('/register', registerValidation, validateRequest, authController.register);
router.post('/login', loginValidation, validateRequest, authController.login);

export default router;