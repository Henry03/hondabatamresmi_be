import express from 'express';
import { Router } from 'express';
import carRoutes from './car.routes';
import authRoutes from './auth.routes'
import tagRoutes from './tag.routes'
import promoRoutes from './promo.routes'
import commentRoutes from './comment.routes'
import certificateRoutes from './certificate.routes'
import carouselRoutes from './carousel.routes'
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const router = Router();

router.use('/cars', carRoutes);
router.use('/auth', authRoutes);
router.use('/tags', tagRoutes);
router.use('/promos', promoRoutes);
router.use('/comments', commentRoutes);
router.use('/certificates', certificateRoutes);
router.use('/carousels', carouselRoutes);
router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))


export default router;
