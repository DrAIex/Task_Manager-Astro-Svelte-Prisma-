<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  export let task = null;
  export let isOpen = true;
  
  let darkMode = false;

  let editedTask = {
    title: '',
    description: '',
    priority: 'low',
    dueDate: ''
  };

  let isSubmitting = false;
  let errorMessage = '';
  
  onMount(() => {
    if (typeof window !== 'undefined') {
      darkMode = localStorage.getItem('darkMode') === 'true';
      
      window.addEventListener('themeChanged', (event) => {
        darkMode = event.detail.darkMode;
      });
    }
    
    return () => {
      window.removeEventListener('themeChanged', (event) => {
        darkMode = event.detail.darkMode;
      });
    };
  });

  $: if (isOpen && task) {

    const dueDate = new Date(task.dueDate);
    const formattedDate = dueDate.toISOString().split('T')[0];
    
    editedTask = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: formattedDate
    };
    
    errorMessage = '';
  }

  function close() {
    isOpen = false;
    dispatch('close');
  }

  async function handleSubmit() {
    isSubmitting = true;
    errorMessage = '';
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedTask,
          id: task.id,
          completed: task.completed
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        close();
        dispatch('save', { ...result.task });
        dispatch('taskUpdated', { task: result.task });
      } else {
        errorMessage = result.error || 'Ошибка при обновлении задачи';
      }
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      errorMessage = 'Произошла ошибка при обновлении задачи';
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
<div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex" transition:fade={{ duration: 200 }}>
  <div 
    class={`relative p-6 m-auto rounded-lg shadow-xl max-w-md w-full ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} transition-colors duration-300`}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-headline"
    transition:fly={{ y: -20, duration: 300 }}
  >
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold" id="modal-headline">Редактирование задачи</h3>
      <button 
        type="button" 
        class={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'} transition-colors duration-300`}
        on:click={close}
        aria-label="Закрыть"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    {#if errorMessage}
      <div 
        class={darkMode ? 
          "bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4" : 
          "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"} 
        role="alert"
        transition:fade={{ duration: 200 }}
      >
        <p>{errorMessage}</p>
      </div>
    {/if}
    
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label for="edit-title" class={darkMode ? "block text-sm font-medium text-gray-300" : "block text-sm font-medium text-gray-700"}>Заголовок</label>
        <input
          type="text"
          id="edit-title"
          bind:value={editedTask.title}
          required
          class={darkMode ? 
            "mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" : 
            "bg-gray-100 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"}
        />
      </div>

      <div>
        <label for="edit-description" class={darkMode ? "block text-sm font-medium text-gray-300" : "block text-sm font-medium text-gray-700"}>Описание</label>
        <textarea
          id="edit-description"
          bind:value={editedTask.description}
          required
          rows="3"
          class={darkMode ? 
            "mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" : 
            "bg-gray-100 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"}
        ></textarea>
      </div>

      <div>
        <label for="edit-priority" class={darkMode ? "block text-sm font-medium text-gray-300" : "block text-sm font-medium text-gray-700"}>Приоритет</label>
        <select
          id="edit-priority"
          bind:value={editedTask.priority}
          required
          class={darkMode ? 
            "mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" : 
            "bg-gray-100 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"}
        >
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
      </div>

      <div>
        <label for="edit-dueDate" class={darkMode ? "block text-sm font-medium text-gray-300" : "block text-sm font-medium text-gray-700"}>Срок выполнения</label>
        <input
          type="date"
          id="edit-dueDate"
          bind:value={editedTask.dueDate}
          required
          class={darkMode ? 
            "mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" : 
            "bg-gray-100 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"}
        />
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          on:click={close}
          class={darkMode ? 
            "px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300" : 
            "px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          class={darkMode ? 
            "px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-300" : 
            "px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-300"}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  </div>
</div>
{/if} 