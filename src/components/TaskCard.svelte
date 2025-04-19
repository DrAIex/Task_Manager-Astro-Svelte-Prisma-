<script>
  import { fade, slide, fly, scale } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  
  export let task;
  export let darkMode = false;
  export let index = 0;
  
  export let onComplete;
  export let onEdit;
  export let onDelete;

  let isDetailsPage = false;
  
  if (typeof window !== 'undefined') {
    isDetailsPage = window.location.pathname.includes(`/tasks/${task.id}`);
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

  function getBorderColorClass(priority) {
    if (darkMode) {
      switch (priority) {
        case 'high':
          return 'border-red-800';
        case 'medium':
          return 'border-yellow-800';
        case 'low':
          return 'border-green-800';
        default:
          return 'border-gray-700';
      }
    } else {
      switch (priority) {
        case 'high':
          return 'border-red-300';
        case 'medium':
          return 'border-yellow-300';
        case 'low':
          return 'border-green-300';
        default:
          return 'border-gray-200';
      }
    }
  }

  function getRandomAnimation() {

    if (typeof window !== 'undefined' && 
        window.matchMedia && 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

      return (node) => fade(node, { duration: 400 });
    }
    
    const animations = [
      (node) => fly(node, { y: 30, x: 0, duration: 400, delay: index * 40 }),
      (node) => fly(node, { y: 0, x: -30, duration: 400, delay: index * 40 }),
      (node) => fly(node, { y: 0, x: 30, duration: 400, delay: index * 40 }),
      (node) => scale(node, { duration: 400, easing: elasticOut, delay: index * 40 })
    ];
    
    return animations[index % animations.length];
  }

  function getISODate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
</script>

<article 
  in:getRandomAnimation()
  out:slide={{ duration: 300 }}
  class={`border-l-4 ${getBorderColorClass(task.priority)} ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden hover:shadow-md transition-all duration-300`} 
  class:opacity-60={task.completed}
  aria-labelledby={`task-title-${task.id}`}
>
  <header class={`${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50 text-gray-800'} border-b p-4 flex justify-between items-center transition-colors duration-300`}>
    <h3 id={`task-title-${task.id}`} class="text-lg font-medium">
      {#if !isDetailsPage}
        <a href={`/tasks/${task.id}`} class="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {task.title}
        </a>
      {:else}
        {task.title}
      {/if}
    </h3>
    <span 
      class={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityClass(task.priority)} transition-colors duration-300`}
      aria-label={`Приоритет: ${getPriorityText(task.priority)}`}
    >
      {getPriorityText(task.priority)}
    </span>
  </header>
  <div class="p-4">
    <p class={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 transition-colors duration-300`}>{task.description}</p>
    <div class="flex flex-col sm:flex-row justify-between">
      <div class={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2 sm:mb-0 transition-colors duration-300`}>
        <div>
          <span>Срок: </span>
          <time datetime={getISODate(task.dueDate)}>{formatDate(task.dueDate)}</time>
        </div>
        <div>
          <span>Статус: </span>
          <span class={task.completed ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-blue-400' : 'text-blue-600')}>
            {task.completed ? 'Завершена' : 'Активна'}
          </span>
        </div>
      </div>
      {#if !isDetailsPage}
        <div class="flex space-x-2">
          <button 
            on:click={() => onComplete(task)}
            class={`px-3 py-1 text-xs rounded ${darkMode ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} transition-colors duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            aria-label={task.completed ? 'Вернуть задачу в работу' : 'Отметить задачу как завершенную'}
          >
            {task.completed ? 'Вернуть в работу' : 'Завершить'}
          </button>
          <button 
            on:click={() => onEdit(task)}
            class={`px-3 py-1 text-xs rounded ${darkMode ? 'bg-green-900 text-green-200 hover:bg-green-800' : 'bg-green-100 text-blue-700 hover:bg-green-200'} transition-colors duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            aria-label={`Редактировать задачу "${task.title}"`}
          >
            Редактировать
          </button>
          <button 
            on:click={() => onDelete(task.id)}
            class={`px-3 py-1 text-xs rounded ${darkMode ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'} transition-colors duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            aria-label={`Удалить задачу "${task.title}"`}
          >
            Удалить
          </button>
          <a 
            href={`/tasks/${task.id}`}
            class={`px-3 py-1 text-xs rounded ${darkMode ? 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'} transition-colors duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center`}
            aria-label={`Просмотреть детали задачи "${task.title}"`}
          >
            Подробности
          </a>
        </div>
      {/if}
    </div>
  </div>
</article> 