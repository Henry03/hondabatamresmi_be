import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { errorResponse, response } from '../utils/response';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await prisma.certificate.findMany({
      select: {
        id: true,
        type: true,
        url: true
      },
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return response(res, true, 200, 'Certificate retrieved successfully', tags);
  } catch (error) {
    next(error);
  }
}

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
    
    const { mediaFiles } = req.body;

    // Media
    if(mediaFiles) {
      const existingMedias = await prisma.certificate.findMany({
        select: { id: true }
      });
  
      const existingMediaIds = existingMedias.map(t => t.id);
      const newMediaIds = mediaFiles;
  
      const mediasToDelete = existingMediaIds.filter(id => !newMediaIds.includes(id));
      await prisma.certificate.deleteMany({
        where: {
          id: { in: mediasToDelete }
        }
      });
    }

    if (req.files && Array.isArray(req.files)) {
      await Promise.all(
        req.files.map((file) => {
          const type = file.mimetype.startsWith('image') ? 'IMAGE' : 'VIDEO';

          const url = `${process.env.BASE_URL}/uploads/${file.filename}`;

          return prisma.certificate.create({
            data: {
              url,
              type
            },
          });
        })
      );
    }

    return response(res, true, 200, 'Certificates updated successfully');
  } catch (err) {
    next(err);
  }
};
