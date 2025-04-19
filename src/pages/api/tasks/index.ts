import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);

    const priority = url.searchParams.get('priority');
    const completed = url.searchParams.get('completed');

    const where: any = {};

    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      where.priority = priority;
    }

    if (completed !== null) {
      where.completed = completed === 'true';
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return new Response(
      JSON.stringify({ success: true, tasks }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Ошибка получения задач' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}; 