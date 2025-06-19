import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import AuthenticateJWT from '../middlewares/authenticateJWT';
import { validateRequest } from '../middlewares/validateRequest';
import multer from 'multer';
import path from 'path';
import { deleteItemValidation, getPaginatedDataValidation, idItemValidation } from '../validations/validations';
import { promoValidation } from '../validations/promo.validations';
import { commentValidation } from '../validations/comment.validations';

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

router.get('/getHomeList', commentController.getHomeList);

router.use(AuthenticateJWT);

router.get('/', commentController.getAll);
router.get('/:id', idItemValidation, validateRequest, commentController.getDetail)
router.post('/', getPaginatedDataValidation, validateRequest, commentController.getAllWithPagination);
router.post('/create', upload.single('media'), commentValidation, validateRequest, commentController.create);
router.put('/', upload.single('media'), commentValidation, validateRequest, commentController.update);
router.delete('/:id', deleteItemValidation, validateRequest, commentController.destroy)

export default router;
