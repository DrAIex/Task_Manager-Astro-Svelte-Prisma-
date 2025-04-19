import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mockPrisma, mockPrismaClient } from '../mocks/prisma';
import { parseAPIResponse } from '../utils/api';
import { POST as createTask } from '../../src/pages/api/tasks/create';

mockPrisma();

describe('POST /api/tasks/create API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
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
    
    mockPrismaClient.task.create.mockImplementation(() => Promise.resolve(newTask));
    
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
    const data = await parseAPIResponse(response);

    expect(data.success).toBe(false);
    expect(data.error).toBe('Ошибка валидации данных');
    expect(data.details).toBeDefined();
    expect(mockPrismaClient.task.create).not.toHaveBeenCalled();
  });
}); 