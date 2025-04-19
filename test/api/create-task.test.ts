import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAPIResponse } from '../utils/api';
import { POST as createTask } from '../../src/pages/api/tasks/create';

vi.mock('../../src/lib/prisma', () => {
  return {
    prisma: {
      task: {
        create: vi.fn()
      }
    }
  };
});

import { prisma } from '../../src/lib/prisma';

describe('POST /api/tasks/create API', () => {
  beforeEach(() => {

    vi.clearAllMocks();
  });

  it('должен создавать новую задачу при валидных данных', async () => {

    const taskData = {
      title: 'Новая тестовая задача',
      description: 'Описание новой тестовой задачи',
      priority: 'medium',
      dueDate: '2023-12-15'
    };

    const formData = new FormData();
    Object.entries(taskData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const newTask = {
      id: 4,
      ...taskData,
      dueDate: new Date(taskData.dueDate),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (prisma.task.create as any).mockResolvedValue(newTask);

    const request = {
      formData: () => Promise.resolve(formData)
    };

    const response = await createTask({ request } as any);

    expect(response.status).toBe(201);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(true);
    expect(data.task).toBeDefined();
    expect(data.task.title).toBe(taskData.title);
    expect(data.task.description).toBe(taskData.description);
    expect(data.task.priority).toBe(taskData.priority);

    expect(prisma.task.create).toHaveBeenCalledTimes(1);

    expect(prisma.task.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: expect.any(Date)
      })
    });
  });

  it('должен возвращать ошибку валидации при некорректных данных', async () => {

    const taskData = {
      title: 'Новая задача',
      description: 'Описание задачи',
      priority: 'invalid',
      dueDate: '2023-12-15'
    };

    const formData = new FormData();
    Object.entries(taskData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const request = {
      formData: () => Promise.resolve(formData)
    };

    const response = await createTask({ request } as any);

    expect(response.status).toBe(400);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Ошибка валидации данных');
    expect(data.details).toBeDefined();

    expect(prisma.task.create).not.toHaveBeenCalled();
  });

  it('должен обрабатывать ошибки сервера при создании задачи', async () => {

    const taskData = {
      title: 'Новая задача',
      description: 'Описание задачи',
      priority: 'high',
      dueDate: '2023-12-15'
    };

    const formData = new FormData();
    Object.entries(taskData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    (prisma.task.create as any).mockRejectedValue(new Error('Ошибка базы данных'));

    const request = {
      formData: () => Promise.resolve(formData)
    };

    const response = await createTask({ request } as any);

    expect(response.status).toBe(400);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Ошибка создания задачи');
  });
}); 