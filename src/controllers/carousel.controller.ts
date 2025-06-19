import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { errorResponse, response } from '../utils/response';

export const getAllWithPagination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      sortBy = "name",
      sortOrder = "asc"
    } = req.body;

    const isShowAll = pageSize === "all";
    const pageNumber = parseInt(page as string, 10);
    const pageLimit = isShowAll ? undefined : parseInt(pageSize as string, 10);
    const skip = isShowAll ? undefined : (pageNumber - 1) * (pageLimit as number);

    const [carousels, total] = await Promise.all([
      prisma.carousel.findMany({
        select: {
          id: true,
          name: true,
          link: true,
          mediaUrl: true,
          mediaType: true,
          createdAt: true,
        },
        where: {
          deletedAt: null,
          name: { contains: search as string, mode: 'insensitive' }
        },
        orderBy: {
          [sortBy as string]: sortOrder === "asc" ? "asc" : "desc",
        },
        skip,
        take: pageLimit
      }),
      prisma.carousel.count({
        where: {
          deletedAt: null,
          name: { contains: search as string, mode: 'insensitive' }
        }
      })
    ])

    const responseData = {
      data: carousels,
      meta: {
        total,
        page: isShowAll ? 1 : pageNumber,
        pageSize: isShowAll ? total : pageLimit,
        totalPages: isShowAll ? 1 : Math.ceil(total / (pageLimit as number)),
      }
    }

    return response(res, true, 200, "Carousels retrieved successfully", responseData);
  } catch (error) {
    next(error)
  }
}

export const getHomeList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const carousels = await prisma.carousel.findMany({
        select: {
          id: true,
          mediaUrl: true,
          mediaType: true,
          link: true
        },
        where: {
          deletedAt: null
        },
        orderBy: {
          createdAt: 'desc'
        },
      })

    return response(res, true, 200, "Carousels retrieved successfully", carousels);
  } catch (error) {
    next(error)
  }
}

export const getDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const promo = await prisma.promo.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        page: true,
        mediaUrl: true,
        mediaType: true,
        isGlobal: true,
        carPromos: {
          select: {
            carId: true,
          }
        }
      }
    });

    if (!promo) {
      return errorResponse(res, 404, 'Promo not found');
    }

    const { carPromos, ...rest } = promo;
    const formattedPromo = {
      ...rest,
      cars: promo.carPromos.map(carPromo =>
        ({
          id: carPromo.carId,
        })
      ),
    };

    return response(res, true, 200, 'Car retrieved successfully', formattedPromo);
  } catch (err) {
    next(err);
  }
};


export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      const formattedErrors = {
        "media" : ["Media is required"],
      }
      return errorResponse(res, 422, 'The given data was invalid', formattedErrors);
    }
    
    const { name, link } = req.body;

    const file = req.file;
    const mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    const mediaType = file.mimetype.startsWith('image') ? 'IMAGE' : 'VIDEO';


    const newCarousel = await prisma.carousel.create({
      data: {
        name,
        mediaUrl,
        mediaType,
        link
      }
    });

    return response(res, true, 201, 'Carousel created successfully');
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (
      (!req.file) &&
      (!req.body.mediaFiles || req.body.mediaFiles.length === 0)
    ) {
      const formattedErrors = {
        "media": ["Media is required"],
      };
      return errorResponse(res, 422, 'The given data was invalid', formattedErrors);
    }
    
    const { id, name, link } = req.body;

    const data: any = {
      name,
      link
    };

    if(req.file){
      const file = req.file;
      data.mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      data.mediaType = file.mimetype.startsWith('image') ? 'IMAGE' : 'VIDEO';
    }

    const carousel = await prisma.carousel.update({
      where: {
        id
      },
      data
    });

    return response(res, true, 200, 'Carousel updated successfully');
  } catch (err) {
    next(err);
  }
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const carousel = await prisma.carousel.findUnique({ where: { id } });
    
    if (!carousel || carousel.deletedAt !== null) {
      return response(res, false, 404, 'Carousel not found');
    }

    await prisma.carousel.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      }
    })

    return response(res, true, 200, 'Carousel deleted successfully');
  } catch(error) {
    next(error)
  }
}