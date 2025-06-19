import { Router } from 'express';
import * as certificateController from '../controllers/certificate.controller';
import AuthenticateJWT from '../middlewares/authenticateJWT';
import { validateRequest } from '../middlewares/validateRequest';
import { createCarValidation, updateCarValidation } from '../validations/car.validations';
import multer from 'multer';
import path from 'path';
import { deleteItemValidation, getPaginatedDataValidation } from '../validations/validations';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);

        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({storage, limits: {fileSize: 10 * 1024 * 1024}}); //10MB limit

const router = Router();

router.get('/', certificateController.getAll);

router.use(AuthenticateJWT);

router.put('/', upload.array('media', 20), certificateController.update);

export default router;
