import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAPIResponse } from '../utils/api';
import { GET as getTaskById } from '../../src/pages/api/tasks/[id]';
import { mockTasks } from '../mocks/prisma';

vi.mock('../../src/lib/prisma', () => {
  return {
    prisma: {
      task: {
        findUnique: vi.fn()
      }
    }
  };
});

import { prisma } from '../../src/lib/prisma';

describe('GET /api/tasks/[id] API', () => {
  beforeEach(() => {

    vi.clearAllMocks();
  });

  it('должен возвращать задачу по ID', async () => {

    (prisma.task.findUnique as any).mockResolvedValue(mockTasks[0]);

    const request = {
      url: 'http://localhost/api/tasks/1'
    };
    
    const params = {
      id: '1'
    };

    const response = await getTaskById({ request, params } as any);

    expect(response.status).toBe(200);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(true);
    expect(data.task.id).toBe(1);
    expect(data.task.title).toBe(mockTasks[0].title);

    expect(prisma.task.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }
    });
  });
  
  it('должен возвращать ошибку при некорректном ID', async () => {

    const request = {
      url: 'http://localhost/api/tasks/abc'
    };
    
    const params = {
      id: 'abc'
    };

    const response = await getTaskById({ request, params } as any);

    expect(response.status).toBe(400);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Некорректный ID задачи');

    expect(prisma.task.findUnique).not.toHaveBeenCalled();
  });
  
  it('должен возвращать ошибку, если задача не найдена', async () => {

    (prisma.task.findUnique as any).mockResolvedValue(null);

    const request = {
      url: 'http://localhost/api/tasks/999'
    };
    
    const params = {
      id: '999'
    };

    const response = await getTaskById({ request, params } as any);

    expect(response.status).toBe(404);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Задача не найдена');

    expect(prisma.task.findUnique).toHaveBeenCalledWith({
      where: { id: 999 }
    });
  });
  
  it('должен обрабатывать ошибки сервера', async () => {

    (prisma.task.findUnique as any).mockRejectedValue(new Error('Test error'));

    const request = {
      url: 'http://localhost/api/tasks/1'
    };
    
    const params = {
      id: '1'
    };

    const response = await getTaskById({ request, params } as any);

    expect(response.status).toBe(500);

    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Ошибка при получении задачи');
  });
}); 