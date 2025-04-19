import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import { mockFetch } from '../mocks/svelte';
import TaskForm from '../../src/components/TaskForm.svelte';

describe('TaskForm Component', () => {
  beforeEach(() => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => null)
      },
      writable: true
    });

    window.addEventListener = vi.fn();

    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('должен отобразить форму с полями', () => {
    render(TaskForm);
    expect(screen.getByLabelText(/Заголовок/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Описание/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Приоритет/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Срок выполнения/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Создать задачу/i })).toBeInTheDocument();
  });

  it('должен отправлять форму с данными', async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    const mockResponse = {
      success: true,
      task: {
        id: 1,
        title: 'Тестовая задача',
        description: 'Описание тестовой задачи',
        priority: 'high',
        dueDate: '2100-01-01T00:00:00.000Z',
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    };
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
      ok: true,
      status: 201
    });

    const customEventMock = vi.spyOn(document, 'dispatchEvent');

    const announcement = document.createElement('div');
    announcement.id = 'task-form-announcement';
    document.body.appendChild(announcement);

    render(TaskForm);

    await fireEvent.input(screen.getByLabelText(/Заголовок/i), { target: { value: 'Тестовая задача' } });
    await fireEvent.input(screen.getByLabelText(/Описание/i), { target: { value: 'Описание тестовой задачи' } });
    await fireEvent.change(screen.getByLabelText(/Приоритет/i), { target: { value: 'high' } });
    await fireEvent.input(screen.getByLabelText(/Срок выполнения/i), { target: { value: futureDateString } });

    await fireEvent.click(screen.getByRole('button', { name: /Создать задачу/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/tasks/create', expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      }));
    });

    document.body.removeChild(announcement);
  });

  it('должен отображать ошибку при неудачной отправке', async () => {

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    const mockResponse = {
      success: false,
      error: 'Ошибка при создании задачи'
    };
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
      ok: false,
      status: 400
    });

    render(TaskForm);

    await fireEvent.input(screen.getByLabelText(/Заголовок/i), { target: { value: 'Тестовая задача' } });
    await fireEvent.input(screen.getByLabelText(/Описание/i), { target: { value: 'Описание тестовой задачи' } });
    await fireEvent.change(screen.getByLabelText(/Приоритет/i), { target: { value: 'high' } });
    await fireEvent.input(screen.getByLabelText(/Срок выполнения/i), { target: { value: futureDateString } });

    await fireEvent.click(screen.getByRole('button', { name: /Создать задачу/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Ошибка при создании задачи')).toBeInTheDocument();
    });
  });
}); 