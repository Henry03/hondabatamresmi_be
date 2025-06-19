import { Router } from 'express';
import * as carController from '../controllers/car.controller';
import AuthenticateJWT from '../middlewares/authenticateJWT';
import { validateRequest } from '../middlewares/validateRequest';
import { createCarValidation, updateCarValidation } from '../validations/car.validations';
import multer from 'multer';
import path from 'path';
import { deleteItemValidation, getPaginatedDataValidation, idItemValidation, slugParamItemValidation } from '../validations/validations';

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

router.get('/getHomeList', carController.getHomeList);
router.get('/list', carController.getList);
router.get('/detail/:slug', slugParamItemValidation, validateRequest, carController.getCarDetailBySlug)

router.use(AuthenticateJWT);

router.get('/', carController.getAll);
router.get('/:id', deleteItemValidation, validateRequest, carController.getCarDetail)
router.post('/', getPaginatedDataValidation, validateRequest, carController.getAllWithPagination);
router.post('/create', upload.array('media', 10), createCarValidation, validateRequest, carController.addCar);
router.put('/', upload.array('media', 10), updateCarValidation, validateRequest, carController.update);
router.delete('/:id', deleteItemValidation, validateRequest, carController.destroy)

export default router;
