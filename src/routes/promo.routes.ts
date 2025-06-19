import { Router } from 'express';
import * as promoController from '../controllers/promo.controller';
import AuthenticateJWT from '../middlewares/authenticateJWT';
import { validateRequest } from '../middlewares/validateRequest';
import multer from 'multer';
import path from 'path';
import { deleteItemValidation, getPaginatedDataValidation, idBodyItemValidation, idItemValidation, slugParamItemValidation } from '../validations/validations';
import { promoValidation } from '../validations/promo.validations';

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

router.get('/getHomeList', promoController.getHomeList);
router.get('/detail/:slug', slugParamItemValidation, validateRequest, promoController.getDetailBySlug)

router.use(AuthenticateJWT);

router.get('/', promoController.getAll);
router.get('/:id', idItemValidation, validateRequest, promoController.getDetail)
router.post('/', getPaginatedDataValidation, validateRequest, promoController.getAllWithPagination);
router.post('/create', upload.single('media'), promoValidation, validateRequest, promoController.create);
router.put('/', upload.single('media'), idBodyItemValidation, promoValidation, validateRequest, promoController.update);
router.delete('/:id', deleteItemValidation, validateRequest, promoController.destroy)

export default router;
