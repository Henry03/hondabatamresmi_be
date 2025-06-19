import { Router } from 'express';
import carRoutes from './car.routes';
import authRoutes from './auth.routes'
import tagRoutes from './tag.routes'
import promoRoutes from './promo.routes'
import commentRoutes from './comment.routes'
import certificateRoutes from './certificate.routes'
import carouselRoutes from './carousel.routes'

const router = Router();

router.use('/cars', carRoutes);
router.use('/auth', authRoutes);
router.use('/tags', tagRoutes);
router.use('/promos', promoRoutes);
router.use('/comments', commentRoutes);
router.use('/certificates', certificateRoutes);
router.use('/carousels', carouselRoutes);

export default router;
