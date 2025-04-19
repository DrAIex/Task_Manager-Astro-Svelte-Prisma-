import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const TaskSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  description: z.string().min(1, 'Описание обязательно'),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Приоритет должен быть low, medium или high' }),
  }),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Некорректная дата',
  }),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;
    const dueDate = formData.get('dueDate') as string;

    const taskData = {
      title,
      description,
      priority,
      dueDate,
    };

    const validatedData = TaskSchema.parse(taskData);

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        dueDate: new Date(validatedData.dueDate),
      },
    });

    return new Response(
      JSON.stringify({ success: true, task }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    
    let errorMessage = 'Ошибка создания задачи';
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
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}; 