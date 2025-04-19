import { vi } from 'vitest';

export const mockTaskFormProps = {
  onTaskCreated: vi.fn()
};

export const mockTaskListProps = {
  tasks: [
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
    }
  ]
};

export const mockTaskEditModalProps = {
  task: {
    id: 1,
    title: 'Тестовая задача 1',
    description: 'Описание тестовой задачи 1',
    priority: 'high',
    dueDate: new Date('2023-12-31'),
    completed: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  isOpen: true,
  onClose: vi.fn(),
  onTaskUpdated: vi.fn()
};

export function mockFetch(response: any, status = 200) {
  return vi.spyOn(global, 'fetch').mockResolvedValue({
    json: vi.fn().mockResolvedValue(response),
    status,
    ok: status >= 200 && status < 300,
    headers: new Headers({ 'Content-Type': 'application/json' }),
    text: vi.fn().mockResolvedValue(JSON.stringify(response))
  } as unknown as Response);
} 