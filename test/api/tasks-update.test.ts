import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAPIResponse } from '../utils/api';
import { PUT as updateTask } from '../../src/pages/api/tasks/[id]';
import { mockTasks } from '../mocks/prisma';

vi.mock('../../src/lib/prisma', () => {
  return {
    prisma: {
      task: {
        findUnique: vi.fn(),
        update: vi.fn()
      }
    }
  };
});

import { prisma } from '../../src/lib/prisma';

describe('PUT /api/tasks/[id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен обновлять задачу', async () => {

    const updateData = {
      title: 'Обновлённый заголовок',
      description: 'Обновлённое описание',
      priority: 'high',
      completed: true
    };

    (prisma.task.findUnique as any).mockResolvedValue(mockTasks[0]);

    const updatedTask = {
      ...mockTasks[0],
      ...updateData,
      updatedAt: new Date()
    };
    (prisma.task.update as any).mockResolvedValue(updatedTask);

    const request = {
      json: () => Promise.resolve(updateData)
    };
    
    const params = {
      id: '1'
    };

    const response = await updateTask({ request, params } as any);

    expect(response.status).toBe(200);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(true);
    expect(data.task.title).toBe('Обновлённый заголовок');
    expect(data.task.description).toBe('Обновлённое описание');
    expect(data.task.priority).toBe('high');
    expect(data.task.completed).toBe(true);

    expect(prisma.task.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }
    });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining(updateData)
    });
  });
  
  it('должен обновлять частично задачу', async () => {

    const updateData = {
      title: 'Обновлённый заголовок'
    };

    (prisma.task.findUnique as any).mockResolvedValue(mockTasks[0]);

    const updatedTask = {
      ...mockTasks[0],
      ...updateData,
      updatedAt: new Date()
    };
    (prisma.task.update as any).mockResolvedValue(updatedTask);

    const request = {
      json: () => Promise.resolve(updateData)
    };
    
    const params = {
      id: '1'
    };

    const response = await updateTask({ request, params } as any);

    expect(response.status).toBe(200);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(true);
    expect(data.task.title).toBe('Обновлённый заголовок');
    expect(data.task.description).toBe(mockTasks[0].description);

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        title: 'Обновлённый заголовок'
      })
    });
  });
  
  it('должен возвращать ошибку при некорректном ID', async () => {

    const updateData = {
      title: 'Обновлённый заголовок'
    };

    const request = {
      json: () => Promise.resolve(updateData)
    };
    
    const params = {
      id: 'abc'
    };

    const response = await updateTask({ request, params } as any);

    expect(response.status).toBe(400);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Некорректный ID задачи');

    expect(prisma.task.findUnique).not.toHaveBeenCalled();
    expect(prisma.task.update).not.toHaveBeenCalled();
  });
  
  it('должен возвращать ошибку, если задача не найдена', async () => {

    (prisma.task.findUnique as any).mockResolvedValue(null);

    const updateData = {
      title: 'Обновлённый заголовок'
    };

    const request = {
      json: () => Promise.resolve(updateData)
    };
    
    const params = {
      id: '999'
    };

    const response = await updateTask({ request, params } as any);

    expect(response.status).toBe(404);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Задача не найдена');

    expect(prisma.task.findUnique).toHaveBeenCalledWith({
      where: { id: 999 }
    });

    expect(prisma.task.update).not.toHaveBeenCalled();
  });
  
  it('должен обрабатывать ошибки валидации', async () => {

    const updateData = {
      priority: 'invalid'
    };

    (prisma.task.findUnique as any).mockResolvedValue(mockTasks[0]);

    const request = {
      json: () => Promise.resolve(updateData)
    };
    
    const params = {
      id: '1'
    };

    const response = await updateTask({ request, params } as any);

    expect(response.status).toBe(400);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Ошибка валидации данных');

    expect(prisma.task.update).not.toHaveBeenCalled();
  });
  
  it('должен обрабатывать ошибки сервера', async () => {

    const updateData = {
      title: 'Обновлённый заголовок'
    };

    (prisma.task.findUnique as any).mockResolvedValue(mockTasks[0]);

    (prisma.task.update as any).mockRejectedValue(new Error('Test error'));

    const request = {
      json: () => Promise.resolve(updateData)
    };
    
    const params = {
      id: '1'
    };

    const response = await updateTask({ request, params } as any);

    expect(response.status).toBe(400);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Ошибка при обновлении задачи');
  });
}); 