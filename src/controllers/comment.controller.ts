import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { errorResponse, response } from '../utils/response';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await prisma.car.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        deletedAt: null
      },
      orderBy: {
        name: 'asc'
      }
    });

    return response(res, true, 200, 'Cars retrieved successfully', tags);
  } catch (error) {
    next(error);
  }
}

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

    const isCarNameSort = sortBy === "car";

    const [comments, total] = await Promise.all([
      prisma.testimoni.findMany({
        select: {
          id: true,
          name: true,
          message: true,
          imageUrl: true,
          createdAt: true,
          car: {
            select: {
              id: true,
              name: true
            }
          }
        },
        where: {
          deletedAt: null,
          name: { contains: search as string, mode: 'insensitive' }
        },
        orderBy: isCarNameSort ?
        {
          car: {
            name: sortOrder === "asc" ? "asc" : "desc"
          }
        }:
        {
          [sortBy as string]: sortOrder === "asc" ? "asc" : "desc",
        },
        skip,
        take: pageLimit
      }),
      prisma.testimoni.count({
        where: {
          deletedAt: null,
          name: { contains: search as string, mode: 'insensitive' }
        }
      })
    ])


    // const processedPromos = promos.map(({carPromos, ...rest}) => {
      
    //   return {
    //     ...rest,
    //     cars: carPromos.map(carPromo =>
    //       ({ 
    //         ...carPromo.car, 
    //         id: carPromo.car.id, 
    //         name: carPromo.car.name
    //       })
    //     )
    //   };
    // });

    const responseData = {
      data: comments,
      meta: {
        total,
        page: isShowAll ? 1 : pageNumber,
        pageSize: isShowAll ? total : pageLimit,
        totalPages: isShowAll ? 1 : Math.ceil(total / (pageLimit as number)),
      }
    }

    return response(res, true, 200, "Comments retrieved successfully", responseData);
  } catch (error) {
    next(error)
  }
}

export const getHomeList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await prisma.testimoni.findMany({
        select: {
          id: true,
          name: true,
          message: true,
          imageUrl: true,
          createdAt: true,
          car: {
            select: {
              id: true,
              name: true
            }
          }
        },
        where: {
          deletedAt: null
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })

    return response(res, true, 200, "Comments retrieved successfully", comments);
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
    
    const { name, carId, message } = req.body;

    const file = req.file;
    const url = `${process.env.BASE_URL}/uploads/${file.filename}`;

    const newComment = await prisma.testimoni.create({
      data: {
        name,
        carId,
        message,
        imageUrl: url,
      }
    });

    return response(res, true, 201, 'Promo created successfully');
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
    
    const { id, name, message, carId, mediaFiles } = req.body;

    if (carId) {
      const car = await prisma.car.findUnique({ where: { id: carId } });
      if (!car) {
        return errorResponse(res, 400, 'Invalid car ID');
      }
    }

    const data: any = {
      name,
      message,
      car: carId ? { connect: { id: carId } } : undefined
    };

    if(req.file){
      const file = req.file;
      data.imageUrl = `${process.env.BASE_URL}/uploads/${file.filename}`;
    }

    const comment = await prisma.testimoni.update({
      where: {
        id
      },
      data
    });

    return response(res, true, 200, 'Comment updated successfully');
  } catch (err) {
    next(err);
  }
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const comment = await prisma.testimoni.findUnique({ where: { id } });
    
    if (!comment || comment.deletedAt !== null) {
      return response(res, false, 404, 'Comment not found');
    }

    await prisma.testimoni.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      }
    })

    return response(res, true, 200, 'Comment deleted successfully');
  } catch(error) {
    next(error)
  }
}