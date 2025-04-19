import { vi } from 'vitest';

export const mockTasks = [
  {
    id: 1,
    title: 'Тестовая задача 1',
    description: 'Описание тестовой задачи 1',
    priority: 'high',
    dueDate: new Date('2023-12-31'),
    completed: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 2,
    title: 'Тестовая задача 2',
    description: 'Описание тестовой задачи 2',
    priority: 'medium',
    dueDate: new Date('2023-11-15'),
    completed: true,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: 3,
    title: 'Тестовая задача 3',
    description: 'Описание тестовой задачи 3',
    priority: 'low',
    dueDate: new Date('2023-10-01'),
    completed: false,
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03')
  }
];

export const mockPrismaClient = {
  task: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
};

export function mockPrisma() {

  vi.mock('../../../src/lib/prisma', () => {
    return {
      prisma: mockPrismaClient
    };
  });
} 