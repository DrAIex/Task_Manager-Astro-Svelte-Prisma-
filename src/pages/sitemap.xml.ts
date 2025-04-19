import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    return new Response('Site configuration is required to generate sitemap', { status: 500 });
  }

  const tasks = await prisma.task.findMany({
    select: {
      id: true,
      updatedAt: true,
      priority: true,
      completed: true
    },
  });

  const formatDate = (date: Date) => date.toISOString();

  const baseUrl = site.toString().replace(/\/$/, '');

  const getTaskPriority = (task: any) => {

    if (task.completed) {
      return 0.5;
    }

    switch(task.priority) {
      case 'high': return 0.9;
      case 'medium': return 0.8;
      case 'low': return 0.7;
      default: return 0.6;
    }
  };

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${tasks.map((task) => `
  <url>
    <loc>${baseUrl}/tasks/${task.id}</loc>
    <lastmod>${formatDate(task.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${getTaskPriority(task)}</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    },
  });
} 