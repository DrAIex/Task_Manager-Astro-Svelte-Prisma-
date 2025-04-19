import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import { mockFetch, mockTaskListProps } from '../mocks/svelte';
import TaskList from '../../src/components/TaskList.svelte';

describe('TaskList Component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => null)
      },
      writable: true
    });

    window.addEventListener = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('должен отображать список задач', async () => {
    const mockResponse = {
      success: true,
      tasks: mockTaskListProps.tasks
    };
    
    mockFetch(mockResponse);
    const { container } = render(TaskList);

    await waitFor(() => {
      expect(container.querySelector('[role="list"]')).toBeTruthy();
    });

    for (const task of mockTaskListProps.tasks) {
      expect(container.textContent).toContain(task.title);
    }

    expect(screen.getByLabelText(/Приоритет/i, { selector: '#priority-filter' })).toBeTruthy();
    expect(screen.getByLabelText(/Статус/i, { selector: '#status-filter' })).toBeTruthy();
  });

  it('должен обрабатывать ошибку загрузки задач', async () => {
    const mockResponse = {
      success: false,
      error: 'Ошибка загрузки задач'
    };
    
    mockFetch(mockResponse, 500);
    render(TaskList);

    await waitFor(() => {
      expect(screen.getByText(/Ошибка загрузки задач/i)).toBeTruthy();
    });
  });
}); 