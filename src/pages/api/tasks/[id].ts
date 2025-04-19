import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const UpdateTaskSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').optional(),
  description: z.string().min(1, 'Описание обязательно').optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Приоритет должен быть low, medium или high' }),
  }).optional(),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Некорректная дата',
  }).optional(),
  completed: z.boolean().optional(),
});

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id || '0');
    
    if (isNaN(id) || id <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Некорректный ID задачи' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const task = await prisma.task.findUnique({
      where: { id }
    });
    
    if (!task) {
      return new Response(
        JSON.stringify({ success: false, error: 'Задача не найдена' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, task }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching task:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Ошибка при получении задачи' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

async function handleTaskUpdate(request: Request, params: Record<string, string>) {
  try {
    const id = parseInt(params.id || '0');
    
    if (isNaN(id) || id <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Некорректный ID задачи' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const existingTask = await prisma.task.findUnique({
      where: { id }
    });
    
    if (!existingTask) {
      return new Response(
        JSON.stringify({ success: false, error: 'Задача не найдена' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await request.json();

    const validatedData = UpdateTaskSchema.parse(data);

    const updateData: any = { ...validatedData };

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData
    });
    
    return new Response(
      JSON.stringify({ success: true, task: updatedTask }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating task:', error);
    
    let errorMessage = 'Ошибка при обновлении задачи';
    let errorDetails = null;
    
    if (error instanceof z.ZodError) {
      errorMessage = 'Ошибка валидации данных';
      errorDetails = error.format();
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: errorDetails 
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export const PUT: APIRoute = async ({ request, params }) => {
  return handleTaskUpdate(request, params);
};

export const PATCH: APIRoute = async ({ request, params }) => {
  return handleTaskUpdate(request, params);
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id || '0');
    
    if (isNaN(id) || id <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Некорректный ID задачи' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const existingTask = await prisma.task.findUnique({
      where: { id }
    });
    
    if (!existingTask) {
      return new Response(
        JSON.stringify({ success: false, error: 'Задача не найдена' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await prisma.task.delete({
      where: { id }
    });
    
    return new Response(
      JSON.stringify({ success: true, message: 'Задача успешно удалена' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Ошибка при удалении задачи' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}; 