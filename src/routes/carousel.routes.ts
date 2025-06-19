import { Router } from 'express';
import * as carouselController from '../controllers/carousel.controller';
import AuthenticateJWT from '../middlewares/authenticateJWT';
import { validateRequest } from '../middlewares/validateRequest';
import multer from 'multer';
import path from 'path';
import { deleteItemValidation, getPaginatedDataValidation, idItemValidation } from '../validations/validations';
import { carouselValidation } from '../validations/carousel.validations';
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

router.get('/getHomeList', carouselController.getHomeList);

router.use(AuthenticateJWT);

router.get('/:id', idItemValidation, validateRequest, carouselController.getDetail)
router.post('/', getPaginatedDataValidation, validateRequest, carouselController.getAllWithPagination);
router.post('/create', upload.single('media'), carouselValidation, validateRequest, carouselController.create);
router.put('/', upload.single('media'), carouselValidation, validateRequest, carouselController.update);
router.delete('/:id', deleteItemValidation, validateRequest, carouselController.destroy)

export default router;
