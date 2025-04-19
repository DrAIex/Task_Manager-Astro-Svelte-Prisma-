import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAPIResponse } from '../utils/api';
import { DELETE as deleteTask } from '../../src/pages/api/tasks/[id]';
import { mockTasks } from '../mocks/prisma';

vi.mock('../../src/lib/prisma', () => {
  return {
    prisma: {
      task: {
        findUnique: vi.fn(),
        delete: vi.fn()
      }
    }
  };
});

import { prisma } from '../../src/lib/prisma';

describe('DELETE /api/tasks/[id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен удалять задачу', async () => {
    (prisma.task.findUnique as any).mockResolvedValue(mockTasks[0]);
    
    (prisma.task.delete as any).mockResolvedValue(mockTasks[0]);
    
    const request = {
      url: 'http://localhost/api/tasks/1'
    };
    
    const params = {
      id: '1'
    };
    
    const response = await deleteTask({ request, params } as any);
    
    expect(response.status).toBe(200);
    
    const data = await parseAPIResponse(response);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Задача успешно удалена');
    
    expect(prisma.task.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }
    });
    
    expect(prisma.task.delete).toHaveBeenCalledWith({
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
    
    const response = await deleteTask({ request, params } as any);
    
    expect(response.status).toBe(400);
    
    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Некорректный ID задачи');
    
    expect(prisma.task.findUnique).not.toHaveBeenCalled();
    expect(prisma.task.delete).not.toHaveBeenCalled();
  });
  
  it('должен возвращать ошибку, если задача не найдена', async () => {
    (prisma.task.findUnique as any).mockResolvedValue(null);
    
    const request = {
      url: 'http://localhost/api/tasks/999'
    };
    
    const params = {
      id: '999'
    };
    
    const response = await deleteTask({ request, params } as any);
    
    expect(response.status).toBe(404);
    
    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Задача не найдена');
    
    expect(prisma.task.findUnique).toHaveBeenCalledWith({
      where: { id: 999 }
    });
    
    expect(prisma.task.delete).not.toHaveBeenCalled();
  });
  
  it('должен обрабатывать ошибки сервера', async () => {
    (prisma.task.findUnique as any).mockResolvedValue(mockTasks[0]);
    
    (prisma.task.delete as any).mockRejectedValue(new Error('Test error'));
    
    const request = {
      url: 'http://localhost/api/tasks/1'
    };
    
    const params = {
      id: '1'
    };
    
    const response = await deleteTask({ request, params } as any);
    
    expect(response.status).toBe(500);
    
    const data = await parseAPIResponse(response);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Ошибка при удалении задачи');
  });
}); 