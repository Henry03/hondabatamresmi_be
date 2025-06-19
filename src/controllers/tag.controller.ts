import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { response } from '../utils/response';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await prisma.tag.findMany({
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

    return response(res, true, 200, 'Tags retrieved successfully', tags);
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
        sortOrder = "asc",
      } = req.body;
      
      const isShowAll = pageSize === "all";
      const pageNumber = parseInt(page as string, 10);
      const pageLimit = isShowAll ? undefined : parseInt(pageSize as string, 10);
      const skip = isShowAll ? undefined : (pageNumber - 1) * (pageLimit as number);

      const [tags, total] = await Promise.all([
        prisma.tag.findMany({
          where: {
            deletedAt: null,
            OR: [
              { name: { contains: search as string, mode: 'insensitive' } },
              { slug: { contains: search as string, mode: 'insensitive' } },
            ]
          },
          orderBy: {
            [sortBy as string]: sortOrder === "asc" ? "asc" : "desc",
          },
          skip,
          take: pageLimit
        }),
        prisma.tag.count({
          where: {
            deletedAt: null,
            OR: [
              { name: { contains: search as string, mode: 'insensitive' } },
              { slug: { contains: search as string, mode: 'insensitive' } },
            ]
          }
        })
      ])
      const responseData = {
        data: tags,
        meta: {
          total,
          page: isShowAll ? 1 : pageNumber,
          pageSize: isShowAll ? total : pageLimit,
          totalPages: isShowAll ? 1 : Math.ceil(total / (pageLimit as number)),
        }
      }

      return response(res, true, 200, "Tags retrieved successfully", responseData);
    } catch (error) {
        next(error);
    }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug } = req.body;
    const newTag = await prisma.tag.create({
      data: {
        name,
        slug
      }
    });
    return response(res, true, 201, 'Tag created successfully', newTag);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const {
      id,
      name,
      slug
    } = req.body;

    
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag || existingTag.deletedAt !== null) {
      return response(res, false, 404, 'Tag not found or already deleted');
    }

    const slugConflict = await prisma.tag.findUnique({
      where: { slug },
    });

    if (slugConflict) {
      return response(res, false, 400, 'Slug already used');
    }

    await prisma.tag.update({
      where: {
        id: id as string
        },
        data: {
          name,
          slug
        }
    })

    return response(res, true, 200, 'Tag updated successfully');
  } catch (err) {
    next(err);
  }
}

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag || tag.deletedAt !== null) {
      return response(res, false, 404, 'Tag not found or already deleted');
    }

    await prisma.tag.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        slug: `${tag.slug}--deleted-${Date.now()}`,
      }
    })

    return response(res, true, 200, 'Tag deleted successfully');
  } catch (err) {
    next(err);
  }
}