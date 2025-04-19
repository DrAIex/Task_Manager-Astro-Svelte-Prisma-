import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAPIResponse } from '../utils/api';
import { GET as getTasks } from '../../src/pages/api/tasks/index';
import { mockTasks } from '../mocks/prisma';

vi.mock('../../src/lib/prisma', () => {
  return {
    prisma: {
      task: {
        findMany: vi.fn()
      }
    }
  };
});

import { prisma } from '../../src/lib/prisma';

describe('GET /api/tasks API', () => {
  beforeEach(() => {

    vi.clearAllMocks();
  });

  it('должен возвращать список всех задач', async () => {

    (prisma.task.findMany as any).mockResolvedValue([...mockTasks]);

    const request = {
      url: 'http://localhost/api/tasks'
    };

    const response = await getTasks({ request } as any);

    expect(response.status).toBe(200);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(true);
    expect(data.tasks).toHaveLength(mockTasks.length);
    expect(data.tasks[0].title).toBe(mockTasks[0].title);

    expect(prisma.task.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: {
        createdAt: 'desc'
      }
    });
  });
  
  it('должен фильтровать задачи по приоритету', async () => {

    const filteredTasks = mockTasks.filter(t => t.priority === 'high');

    (prisma.task.findMany as any).mockResolvedValue(filteredTasks);

    const request = {
      url: 'http://localhost/api/tasks?priority=high'
    };

    const response = await getTasks({ request } as any);

    expect(response.status).toBe(200);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(true);
    expect(data.tasks.length).toBe(filteredTasks.length);

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          priority: 'high'
        })
      })
    );
  });
  
  it('должен фильтровать задачи по статусу выполнения', async () => {

    const filteredTasks = mockTasks.filter(t => t.completed === true);

    (prisma.task.findMany as any).mockResolvedValue(filteredTasks);

    const request = {
      url: 'http://localhost/api/tasks?completed=true'
    };

    const response = await getTasks({ request } as any);

    expect(response.status).toBe(200);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(true);
    expect(data.tasks.length).toBe(filteredTasks.length);

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          completed: true
        })
      })
    );
  });
  
  it('должен обрабатывать ошибки', async () => {

    (prisma.task.findMany as any).mockRejectedValue(new Error('Test error'));

    const request = {
      url: 'http://localhost/api/tasks'
    };

    const response = await getTasks({ request } as any);

    expect(response.status).toBe(500);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Ошибка получения задач');
  });
}); 