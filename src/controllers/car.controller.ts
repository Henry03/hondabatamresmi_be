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

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          variants : {
            where: { deletedAt: null },
            select: { 
              id: true,
              price: true
            }
          },
          tags: {
            select: {
              tag: {
                select: {
                  name: true,
                  slug: true
                }
              }
            },
            where: {
              tag: {
                deletedAt: null
              }
            }
          }
        },
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: search as string, mode: 'insensitive' }},
            { slug: { contains: search as string, mode: 'insensitive' }}
          ]
        },
        orderBy: {
          [sortBy as string]: sortOrder === "asc" ? "asc" : "desc",
        },
        skip,
        take: pageLimit
      }),
      prisma.car.count({
        where: {
          deletedAt: null,
          name: { contains: search as string, mode: 'insensitive' }
        }
      })
    ])

    const processedCars = cars.map(car => {
      const prices = car.variants.map(v => Number(v.price));
      console.log(car)
      const minPrice = prices.length ? Math.min(...prices) : null;
      const maxPrice = prices.length ? Math.max(...prices) : null;
      const totalVariants = prices.length;

      return {
        ...car,
        variants: car.variants.map(v => ({
          ...v,
          price: Number(v.price) // convert variant.price to number
        })),
        minPrice,
        maxPrice,
        totalVariants,
        tags: car.tags.map(t => t.tag)
      };
    });

    const responseData = {
      data: processedCars,
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
    const cars = await prisma.car.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        variants: {
          where: { deletedAt: null },
          select: { id: true, price: true }
        },
        tags: {
          select: {
            tag: { select: { name: true, slug: true } }
          },
          where: { tag: { deletedAt: null } }
        },
        mediaFiles: {
          select: { id: true, url: true },
          take: 1
        }
      },
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const processedCars = cars.map(car => {
      const prices = car.variants.map(v => Number(v.price));

      const minPrice = prices.length ? Math.min(...prices) : null;
      const totalVariants = prices.length;

      return {
        ...car,
        variants: car.variants.map(v => ({
          ...v,
          price: Number(v.price) // convert variant.price to number
        })),
        minPrice,
        totalVariants,
        tags: car.tags.map(t => t.tag)
      };
    });

    return response(res, true, 200, "Cars retrieved successfully", processedCars);
  } catch (error) {
    next(error)
  }
}

export const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cars = await prisma.car.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        variants: {
          where: { deletedAt: null },
          select: { id: true, price: true }
        },
        tags: {
          select: {
            tag: { select: { id: true, name: true, slug: true } }
          },
          where: { tag: { deletedAt: null } }
        },
        mediaFiles: {
          select: { id: true, url: true },
          take: 1
        }
      },
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });

    const processedCars = cars.map(car => {
      const prices = car.variants.map(v => Number(v.price));

      const minPrice = prices.length ? Math.min(...prices) : null;
      const totalVariants = prices.length;

      return {
        ...car,
        variants: car.variants.map(v => ({
          ...v,
          price: Number(v.price) // convert variant.price to number
        })),
        minPrice,
        totalVariants,
        tags: car.tags.map(t => t.tag)
      };
    });

    return response(res, true, 200, "Cars retrieved successfully", processedCars);
  } catch (error) {
    next(error)
  }
}

export const getCarDetailBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const car = await prisma.car.findUnique({
      select: {
        id: true,
        name: true,
        description: true,
        page: true,
        slug: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true
                }
            }
          }
        },
        variants: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            price: true,
          }
        },
        mediaFiles: {
          select: {
            id: true,
            url: true,
            type: true
          }
        },
        carPromos: {
          select: {
            promo: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                mediaUrl: true,
                mediaType: true,
                slug: true
              },
            }
          },
          where: {
            promo: {
              deletedAt: null
            }
          }
        },
        testimonis: {
          select: {
            id: true,
            name: true,
            message: true,
            imageUrl: true
          },
          where: {
            deletedAt: null
          }
        }
      },
      where: { slug }
    });

    const usedPromoIds = car?.carPromos.map(item => item.promo.id) ?? [];

    const globalPromos = await prisma.promo.findMany({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        mediaUrl: true,
        mediaType: true,
        slug: true
      },
      where: {
        AND: [
          {
            isGlobal: true
          },
          {
            id: {
              notIn : usedPromoIds
            }
          },{
            deletedAt: null
          }
        ]
      }
    })

    const carPromos = car?.carPromos.map(item => item.promo) ?? []

    const mergedPromos = [
      ...carPromos,
      ...globalPromos
    ]

    console.log(mergedPromos)

    if (!car) {
      return errorResponse(res, 404, 'Car not found');
    }

    const formattedCar = {
      ...car,
      variants: car.variants.map(v => ({
        ...v,
        price: Number(v.price)
      })),
      tags: car.tags.map(t => ({
        id: t.tag.id,
        name: t.tag.name
      })),
      carPromos: mergedPromos
    };

    return response(res, true, 200, 'Car retrieved successfully', formattedCar);
  } catch (err) {
    next(err);
  }
};

export const getCarDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const car = await prisma.car.findUnique({
      select: {
        id: true,
        name: true,
        description: true,
        page: true,
        slug: true,
        tags: {
          select: {
            tagId: true
          },
          where: {
            tag: {
              deletedAt: null
            }
          }
        },
        variants: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            price: true,
          }
        },
        mediaFiles: {
          select: {
            id: true,
            url: true,
            type: true
          }
        }
      },
      where: { id }
    });

    if (!car) {
      return errorResponse(res, 404, 'Car not found');
    }

    const formattedCar = {
      ...car,
      variants: car.variants.map(v => ({
        ...v,
        price: Number(v.price)
      })),
      tags: car.tags.map(t => ({
        id: t.tagId
      }))
    };

    return response(res, true, 200, 'Car retrieved successfully', formattedCar);
  } catch (err) {
    next(err);
  }
};


export const addCar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      const formattedErrors = {
        "media" : ["Media is required"],
      }
      return errorResponse(res, 422, 'The given data was invalid', formattedErrors);
    }
    
    const { name, tags, description, page, slug, variants } = req.body;

    const existingSlug = await prisma.car.findFirst({
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

    const newCar = await prisma.car.create({
      data: {
        name,
        description,
        page,
        slug
      }
    });

    await Promise.all(
      tags.map((tagId: string) =>
        prisma.carTag.create({
          data: {
            carId: newCar.id,
            tagId
          },
        })
      )
    );

    if (req.files && Array.isArray(req.files)) {
      await Promise.all(
        req.files.map((file) => {
          const type = file.mimetype.startsWith('image') ? 'IMAGE' : 'VIDEO';

          const url = `${process.env.BASE_URL}/uploads/${file.filename}`;

          return prisma.mediaFile.create({
            data: {
              url,
              type,
              carId: newCar.id,
            },
          });
        })
      );
    }
    
    await Promise.all(
      variants.map((variant: any) => {
        console.log(variant)
        return prisma.variant.create({
          data: {
            name: variant.name,
            price: variant.price,
            carId: newCar.id,
          },
        });
      })
    );

    return response(res, true, 201, 'Car created successfully');
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (
      (!req.files || (Array.isArray(req.files) && req.files.length === 0)) &&
      (!req.body.mediaFiles || req.body.mediaFiles.length === 0)
    ) {
      const formattedErrors = {
        "media": ["Media is required"],
      };
      return errorResponse(res, 422, 'The given data was invalid', formattedErrors);
    }
    
    const { id, name, tags, description, page, slug, mediaFiles, variants } = req.body;

    const existingSlug = await prisma.car.findFirst({
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

    const car = await prisma.car.update({
      where: {
        id
      },
      data: {
        name,
        description,
        page,
        slug
      }
    });

    // Tags
    const existingTags = await prisma.carTag.findMany({
      where: { carId: id },
      select: { tagId: true }
    });

    const existingTagIds = existingTags.map(t => t.tagId);
    const newTagIds = tags;

    const tagsToDelete = existingTagIds.filter(id => !newTagIds.includes(id));
    const tagsToCreate = newTagIds.filter(id => !existingTagIds.includes(id));

    await prisma.carTag.deleteMany({
      where: {
        carId: id,
        tagId: { in: tagsToDelete }
      }
    });

    await Promise.all(
      tagsToCreate.map((tagId: string) =>
        prisma.carTag.create({
          data: {
            carId: id,
            tagId
          }
        })
      )
    );

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

          const url = `${process.env.BASE_URL}/uploads/${file.filename}`;

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

    // Variants
    const existingVariants = await prisma.variant.findMany({
      where: { carId: id },
      select: { id: true }
    });

    const existingVariantIds = existingVariants.map(t => t.id);
    const newVariantIds = variants.map(item => item.id);
    
    const variantsToDelete = existingVariantIds.filter(id => !newVariantIds.includes(id));
    
    await prisma.variant.deleteMany({
      where: {
        carId: id,
        id: { in: variantsToDelete }
      }
    });

    await Promise.all(
      variants
        .filter((item: any) => item.id)
        .map(async (variant: any) =>
          prisma.variant.update({
            where: {
              id: variant.id
              },
              data: {
                carId: id,
                name: variant.name,
                price: variant.price,
              }
            })
        )
    )

    await Promise.all(
      variants
        .filter((item: any) => !item.id)
        .map((item: any) =>
          prisma.variant.create({
            data: {
              carId: id,
              name:  item.name,
              price: item.price
            }
          })
      )
    );

    // await Promise.all(
    //   variants.map((variant: any) => {
    //     console.log(variant)
    //     return prisma.variant.create({
    //       data: {
    //         name: variant.name,
    //         price: variant.price,
    //         carId: car.id,
    //       },
    //     });
    //   })
    // );

    return response(res, true, 200, 'Car updated successfully');
  } catch (err) {
    next(err);
  }
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const car = await prisma.car.findUnique({ where: { id } });
    
    if (!car || car.deletedAt !== null) {
      return response(res, false, 404, 'Car not found');
    }

    await prisma.car.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        slug: `${car.slug}--deleted-${Date.now()}`
      }
    })

    return response(res, true, 200, 'Car deleted successfully');
  } catch(error) {
    next(error)
  }
}