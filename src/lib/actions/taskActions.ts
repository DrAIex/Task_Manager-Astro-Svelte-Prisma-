import { prisma } from '../prisma';
import { z } from 'zod';

export const TaskSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  description: z.string().min(1, 'Описание обязательно'),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Приоритет должен быть low, medium или high' }),
  }),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Некорректная дата',
  }),
});

export async function createTask(formData: FormData) {
  try {
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

    return { success: true, task };
  } catch (error) {
    console.error('Error creating task:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.format() };
    }
    return { success: false, error: 'Ошибка создания задачи' };
  }
}

export async function getAllTasks() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return { success: true, tasks };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { success: false, error: 'Ошибка получения задач' };
  }
} 