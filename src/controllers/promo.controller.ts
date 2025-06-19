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

    const [promos, total] = await Promise.all([
      prisma.promo.findMany({
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          isGlobal: true,
          createdAt: true,
          slug: true,
          carPromos: {
            select: {
              car: {
                select: {
                  id: true,
                  name: true
              }
            }
          }
        }
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
      prisma.promo.count({
        where: {
          deletedAt: null,
          name: { contains: search as string, mode: 'insensitive' }
        }
      })
    ])


    const processedPromos = promos.map(({carPromos, ...rest}) => {
      
      return {
        ...rest,
        cars: carPromos.map(carPromo =>
          ({ 
            ...carPromo.car, 
            id: carPromo.car.id, 
            name: carPromo.car.name
          })
        )
      };
    });

    const responseData = {
      data: processedPromos,
      meta: {
        total,
        page: isShowAll ? 1 : pageNumber,
        pageSize: isShowAll ? total : pageLimit,
        totalPages: isShowAll ? 1 : Math.ceil(total / (pageLimit as number)),
      }
    }

    return response(res, true, 200, "Cars retrieved successfully", responseData);
  } catch (error) {
    next(error)
  }
}

export const getHomeList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const promos = await prisma.promo.findMany({
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          mediaUrl: true,
          slug: true
        },
        where: {
          deletedAt: null
        },
        orderBy: {
          startDate: 'asc'
        }
      })


    const processedPromos = promos.map(({...rest}) => {
      
      return {
        ...rest
      };
    });

    return response(res, true, 200, "Promos retrieved successfully", processedPromos);
  } catch (error) {
    next(error)
  }
}

export const getDetailBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const promo = await prisma.promo.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        page: true,
        mediaUrl: true,
        mediaType: true,
        isGlobal: true,
        slug: true,
        carPromos: {
          select: {
            car: {
              select: {
                name: true,
                slug: true,
                variants: {
                  select: {
                    price: true
                  },
                  where: {
                    deletedAt: null
                  }
                },
                tags: {
                  select: {
                    tag: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
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

    return response(res, true, 200, 'Promo retrieved successfully', formattedPromo);
  } catch (err) {
    next(err);
  }
};

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
        slug: true,
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
    
    const { name, cars, startDate, endDate, page, isGlobal, slug } = req.body;

    const existingSlug = await prisma.promo.findFirst({
      where: {
        slug
        }
    });

    if(existingSlug != null){
      const formattedErrors = {
        "slug" : ["Slug already exists"],
      }
      return errorResponse(res, 422, 'The given data was invalid', formattedErrors);
    }

    const file = req.file;
    const type = file.mimetype.startsWith('image') ? 'IMAGE' : 'VIDEO';
    const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    const newPromo = await prisma.promo.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        page,
        slug,
        mediaUrl: url,
        mediaType: type,
        isGlobal: isGlobal === 'true'
      }
    });

    if (isGlobal === 'false' && cars && Array.isArray(cars)) {
      await Promise.all(
        cars.map((carId) => 
          prisma.carPromo.create({
            data: {
              promoId: newPromo.id,
              carId,
            },
          })
        )
      );
    }

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
    
    const { id, name, startDate, endDate, cars, page, slug, isGlobal, mediaFiles } = req.body;

    const existingSlug = await prisma.promo.findFirst({
      where: {
        slug
        }
    });

    if(existingSlug != null){
      if(existingSlug.id != id){
        const formattedErrors = {
          "slug" : ["Slug already exists"],
        }
        return errorResponse(res, 422, 'The given data was invalid', formattedErrors);
      }
    }

    const data: any = {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      page,
      isGlobal: isGlobal === "true"
    };

    if(req.file){
      const file = req.file;
      data.mediaType = file.mimetype.startsWith('image') ? 'IMAGE' : 'VIDEO';
      data.mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    }

    const car = await prisma.promo.update({
      where: {
        id
      },
      data
    });

    // Tags
    if(cars) {
      const existingCars = await prisma.carPromo.findMany({
        where: { promoId: id },
        select: { carId: true }
      });
  
      const existingCarIds = existingCars.map(t => t.carId);
      const newCarIds = cars;
  
      const carToDelete = existingCarIds.filter(id => !newCarIds.includes(id));
      const carToCreate = newCarIds.filter(id => !existingCarIds.includes(id));
  
      await prisma.carPromo.deleteMany({
        where: {
          promoId: id,
          carId: { in: carToDelete }
        }
      });
  
      await Promise.all(
        carToCreate.map((carId: string) =>
          prisma.carPromo.create({
            data: {
              promoId: id,
              carId: carId
            }
          })
        )
      );
    } else {
      await prisma.carPromo.deleteMany({
        where: {
          promoId: id
        }
      });
    }

    // Media
    if(mediaFiles) {
      const existingMedias = await prisma.mediaFile.findMany({
        where: { carId: id },
        select: { id: true }
      });
  
      const existingMediaIds = existingMedias.map(t => t.id);
      const newMediaIds = mediaFiles;
  
      const mediasToDelete = existingMediaIds.filter(id => !newMediaIds.includes(id));
      await prisma.mediaFile.deleteMany({
        where: {
          carId: id,
          id: { in: mediasToDelete }
        }
      });
    }

    if (req.files && Array.isArray(req.files)) {
      await Promise.all(
        req.files.map((file) => {
          const type = file.mimetype.startsWith('image') ? 'IMAGE' : 'VIDEO';

          const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

          return prisma.mediaFile.create({
            data: {
              url,
              type,
              carId: car.id,
            },
          });
        })
      );
    }

    return response(res, true, 200, 'Promo updated successfully');
  } catch (err) {
    next(err);
  }
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const promo = await prisma.promo.findUnique({ where: { id } });
    
    if (!promo || promo.deletedAt !== null) {
      return response(res, false, 404, 'Promo not found');
    }

    await prisma.promo.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        slug: `${promo.slug}--deleted-${Date.now()}`
      }
    })

    return response(res, true, 200, 'Promo deleted successfully');
  } catch(error) {
    next(error)
  }
}