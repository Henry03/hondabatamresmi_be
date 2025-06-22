import { Router, Request, Response } from 'express'
import prisma from '../prisma/client'

const router = Router()

router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = 'https://hondabatamresmi.com'

    const staticPaths = [
      { path: '', priority: 1.0 },         
      { path: 'mobil', priority: 0.7 },      
      { path: 'aboutme', priority: 0.6 }, 
    ]

    const cars = await prisma.car.findMany({
      where: { deletedAt: null },
      select: { slug: true }
    })

    const promos = await prisma.promo.findMany({
      where: { deletedAt: null },
      select: { slug: true }
    })

    const urls: { loc: string; priority: number }[] = [
      ...staticPaths.map(item => ({
        loc: `${baseUrl}/${item.path}`,
        priority: item.priority
      })),
      ...cars.map(car => ({
        loc: `${baseUrl}/mobil/${car.slug}`,
        priority: 0.8
      })),
      ...promos.map(promo => ({
        loc: `${baseUrl}/promo/${promo.slug}`,
        priority: 0.8
      }))
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls
        .map(
          url => `
        <url>
          <loc>${url.loc}</loc>
          <changefreq>weekly</changefreq>
          <priority>${url.priority}</priority>
        </url>`
        )
        .join('')}
    </urlset>`

    res.header('Content-Type', 'application/xml')
    res.send(xml)
  } catch (error) {
    console.error('Error generating sitemap:', error)
    res.status(500).send('Internal Server Error')
  }
})

export default router