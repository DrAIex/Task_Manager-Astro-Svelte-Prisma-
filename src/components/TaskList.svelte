<script>
  import { onMount } from 'svelte';
  import { fade, slide, fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import TaskEditModal from './TaskEditModal.svelte';
  import TaskCard from './TaskCard.svelte';
  import PageTransition from './PageTransition.svelte';
  
  let tasks = [];
  let loading = true;
  let error = null;

  let selectedPriority = '';
  let selectedStatus = '';
  let darkMode = false;

  let isEditModalOpen = false;
  let taskToEdit = null;

  let pageKey = Date.now();

  let metaTitleElement;
  let metaDescriptionElement;

  onMount(async () => {
    if (typeof window !== 'undefined') {
      darkMode = localStorage.getItem('darkMode') === 'true';

      window.addEventListener('themeChanged', (event) => {
        darkMode = event.detail.darkMode;
      });

      updateMetaTags();
    }
    
    await loadTasks();

    document.addEventListener('taskCreated', handleTaskCreated);
    
    return () => {
      document.removeEventListener('taskCreated', handleTaskCreated);
      window.removeEventListener('themeChanged', (event) => {
        darkMode = event.detail.darkMode;
      });
    };
  });

  function updateMetaTags() {
    const title = 'Список задач - Менеджер задач';
    const description = 'Управляйте своими задачами: создавайте, редактируйте и отслеживайте выполнение.';

    if (document.title !== title) {
      document.title = title;
    }

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }

  function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode.toString());

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    window.dispatchEvent(
      new CustomEvent('themeChanged', {
        detail: { darkMode }
      })
    );
  }

  async function loadTasks() {
    loading = true;
    error = null;
    
    try {
      let url = '/api/tasks';
      const params = new URLSearchParams();
      
      if (selectedPriority) {
        params.append('priority', selectedPriority);
      }
      
      if (selectedStatus) {
        params.append('completed', selectedStatus === 'completed' ? 'true' : 'false');
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        tasks = result.tasks;

        pageKey = Date.now();
      } else {
        error = result.error || 'Ошибка загрузки задач';
      }
    } catch (err) {
      error = 'Ошибка при получении задач';
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function handleTaskCreated(event) {
    const newTask = event.detail.task;
    tasks = [newTask, ...tasks];
  }

  function handleFilterChange() {
    loadTasks();
  }

  async function toggleTaskStatus(task) {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        tasks = tasks.map(t => t.id === task.id ? result.task : t);
      } else {
        console.error('Ошибка при обновлении статуса задачи:', result.error);
        alert('Не удалось обновить статус задачи');
      }
    } catch (err) {
      console.error('Ошибка при обновлении задачи:', err);
      alert('Ошибка при обновлении задачи');
    }
  }

  function openEditModal(task) {
    taskToEdit = { ...task };
    isEditModalOpen = true;
  }

  function closeEditModal() {
    isEditModalOpen = false;
    taskToEdit = null;
  }

  async function saveEditedTask(event) {
    const updatedTask = event.detail;
    tasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    closeEditModal();
  }

  async function deleteTask(taskId) {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        tasks = tasks.filter(t => t.id !== taskId);
      } else {
        console.error('Ошибка при удалении задачи:', result.error);
        alert('Не удалось удалить задачу');
      }
    } catch (err) {
      console.error('Ошибка при удалении задачи:', err);
      alert('Ошибка при удалении задачи');
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU').format(date);
  }

  function getPriorityClass(priority) {
    if (darkMode) {
      switch (priority) {
        case 'high':
          return 'bg-red-900 text-red-200';
        case 'medium':
          return 'bg-yellow-900 text-yellow-200';
        case 'low':
          return 'bg-green-900 text-green-200';
        default:
          return 'bg-gray-800 text-gray-200';
      }
    } else {
      switch (priority) {
        case 'high':
          return 'bg-red-100 text-red-800';
        case 'medium':
          return 'bg-yellow-100 text-yellow-800';
        case 'low':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  }

  function getPriorityText(priority) {
    switch (priority) {
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
      default:
        return priority;
    }
  }
</script>

<svelte:head>
  <meta name="description" content="Управляйте своими задачами: создавайте, редактируйте и отслеживайте выполнение.">
</svelte:head>

<div 
  class={darkMode ? 
    "bg-gray-800 text-gray-100 rounded-lg shadow transition-colors duration-300" : 
    "bg-white text-gray-800 rounded-lg shadow transition-colors duration-300"}
  in:fade={{ duration: 300 }}
  role="region" 
  aria-labelledby="task-list-title"
>
  <header class="p-6 border-b border-gray-200 dark:border-gray-700">
    <div class="flex justify-between items-center mb-4">
      <h2 id="task-list-title" class="text-xl font-semibold">Список задач</h2>
    </div>
    
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <label for="priority-filter" class={darkMode ? "block text-sm font-medium mb-1 text-gray-300" : "block text-sm font-medium mb-1 text-gray-700"}>Приоритет</label>
        <select
          id="priority-filter"
          bind:value={selectedPriority}
          on:change={handleFilterChange}
          class={darkMode ? 
            "bg-gray-700 text-white border border-gray-600 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" : 
            "bg-gray-50 text-gray-900 border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"}
        >
          <option value="">Все приоритеты</option>
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
      </div>
      
      <div class="flex-1">
        <label for="status-filter" class={darkMode ? "block text-sm font-medium mb-1 text-gray-300" : "block text-sm font-medium mb-1 text-gray-700"}>Статус</label>
        <select
          id="status-filter"
          bind:value={selectedStatus}
          on:change={handleFilterChange}
          class={darkMode ? 
            "bg-gray-700 text-white border border-gray-600 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" : 
            "bg-gray-50 text-gray-900 border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"}
        >
          <option value="">Все статусы</option>
          <option value="active">Активные</option>
          <option value="completed">Завершенные</option>
        </select>
      </div>
    </div>
  </header>
  
  <div class="p-6">
    {#if loading}
      <div 
        class="flex flex-col items-center justify-center p-8" 
        aria-live="polite"
        aria-busy="true"
      >
        <div 
          class={darkMode ? 
            "w-12 h-12 border-t-2 border-b-2 border-indigo-400 rounded-full animate-spin mb-4" : 
            "w-12 h-12 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin mb-4"} 
          role="status"
        ></div>
        <p class="text-center">Загрузка задач...</p>
      </div>
    {:else if error}
      <div 
        class={darkMode ? 
          "bg-red-900 text-red-200 p-4 rounded-lg" : 
          "bg-red-100 text-red-700 p-4 rounded-lg"} 
        role="alert" 
        aria-live="assertive"
      >
        <p>{error}</p>
        <button 
          on:click={loadTasks}
          class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    {:else if tasks.length === 0}
      <div class="text-center py-8">
        <p class={darkMode ? "text-gray-400" : "text-gray-600"}>
          Задач не найдено. Создайте новую задачу!
        </p>
      </div>
    {:else}
      <ul class="space-y-4" role="list" aria-label="Список задач">
        {#each tasks as task, index (task.id)}
          <li animate:flip={{ duration: 300 }} role="listitem">
            <TaskCard
              {task}
              {darkMode}
              {index}
              onComplete={toggleTaskStatus}
              onEdit={openEditModal}
              onDelete={deleteTask}
            />
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

{#if isEditModalOpen && taskToEdit}
  <TaskEditModal
    task={taskToEdit}
    {darkMode}
    isOpen={isEditModalOpen}
    on:close={closeEditModal}
    on:save={saveEditedTask}
  />
{/if} 