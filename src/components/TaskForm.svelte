<script>
  import { fade, fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  
  let formSubmitting = false;
  let errorMessage = '';
  let successMessage = '';
  let darkMode = false;
  let formErrors = {};
  
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

  async function handleSubmit(event) {
    formSubmitting = true;
    errorMessage = '';
    successMessage = '';
    formErrors = {};

    const form = event.target;
    const formData = new FormData(form);

    let isValid = true;
    
    const title = formData.get('title');
    if (!title || title.trim() === '') {
      formErrors.title = 'Заголовок обязателен';
      isValid = false;
    }
    
    const description = formData.get('description');
    if (!description || description.trim() === '') {
      formErrors.description = 'Описание обязательно';
      isValid = false;
    }
    
    const dueDate = formData.get('dueDate');
    if (!dueDate) {
      formErrors.dueDate = 'Дата выполнения обязательна';
      isValid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(dueDate);
      if (selectedDate < today) {
        formErrors.dueDate = 'Дата не может быть в прошлом';
        isValid = false;
      }
    }
    
    if (!isValid) {
      formSubmitting = false;
      errorMessage = 'Пожалуйста, исправьте ошибки в форме';
      return;
    }

    try {
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        successMessage = 'Задача успешно создана!';
        form.reset();

        const customEvent = new CustomEvent('taskCreated', {
          detail: { task: result.task }
        });
        document.dispatchEvent(customEvent);

        const announcement = document.getElementById('task-form-announcement');
        if (announcement) {
          announcement.textContent = 'Задача успешно создана!';
        }
      } else {
        if (result.details) {
          errorMessage = 'Пожалуйста, исправьте ошибки в форме';

          if (Array.isArray(result.details)) {
            result.details.forEach(detail => {
              const field = detail.path[0];
              formErrors[field] = detail.message;
            });
          }
        } else {
          errorMessage = result.error || 'Ошибка при создании задачи';
        }
      }
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      errorMessage = 'Произошла ошибка при отправке формы';
    } finally {
      formSubmitting = false;
    }
  }
</script>

<div 
  class={darkMode ? 
    "bg-gray-800 text-gray-100 shadow rounded-lg p-6 mb-6 transition-colors duration-300" : 
    "bg-white text-gray-800 shadow rounded-lg p-6 mb-6 transition-colors duration-300"}
  in:fly={{ y: 20, duration: 400 }}
  role="region"
  aria-labelledby="form-title"
>
  <h2 id="form-title" class={darkMode ? "text-xl font-semibold mb-4 text-gray-100" : "text-xl font-semibold mb-4 text-gray-800"}>Создать новую задачу</h2>
  
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

  {#if successMessage}
    <div 
      class={darkMode ? 
        "bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded mb-4" : 
        "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"} 
      role="alert"
      transition:fade={{ duration: 200 }}
    >
      <p>{successMessage}</p>
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="space-y-4" novalidate aria-label="Форма создания задачи">
    <div>
      <label for="title" class={darkMode ? "block text-sm font-medium text-gray-300" : "block text-sm font-medium text-gray-700"}>Заголовок <span class="text-red-500" aria-hidden="true">*</span></label>
      <input
        type="text"
        id="title"
        name="title"
        required
        aria-required="true"
        aria-invalid={formErrors.title ? 'true' : 'false'}
        aria-describedby={formErrors.title ? 'title-error' : undefined}
        class={`mt-1 block w-full rounded-md ${formErrors.title ? (darkMode ? 'border-red-500' : 'border-red-500') : (darkMode ? 'border-gray-600' : 'border-gray-300')} ${darkMode ? 
          "bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" : 
          "bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"}`}
      />
      {#if formErrors.title}
        <p id="title-error" class={darkMode ? "mt-1 text-sm text-red-400" : "mt-1 text-sm text-red-600"} transition:fade={{ duration: 200 }}>
          {formErrors.title}
        </p>
      {/if}
    </div>

    <div>
      <label for="description" class={darkMode ? "block text-sm font-medium text-gray-300" : "block text-sm font-medium text-gray-700"}>Описание <span class="text-red-500" aria-hidden="true">*</span></label>
      <textarea
        id="description"
        name="description"
        required
        aria-required="true"
        aria-invalid={formErrors.description ? 'true' : 'false'}
        aria-describedby={formErrors.description ? 'description-error' : undefined}
        rows="3"
        class={`mt-1 block w-full rounded-md ${formErrors.description ? (darkMode ? 'border-red-500' : 'border-red-500') : (darkMode ? 'border-gray-600' : 'border-gray-300')} ${darkMode ? 
          "bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" : 
          "bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"}`}
      ></textarea>
      {#if formErrors.description}
        <p id="description-error" class={darkMode ? "mt-1 text-sm text-red-400" : "mt-1 text-sm text-red-600"} transition:fade={{ duration: 200 }}>
          {formErrors.description}
        </p>
      {/if}
    </div>

    <div>
      <label for="priority" class={darkMode ? "block text-sm font-medium text-gray-300" : "block text-sm font-medium text-gray-700"}>Приоритет <span class="text-red-500" aria-hidden="true">*</span></label>
      <select
        id="priority"
        name="priority"
        required
        aria-required="true"
        class={`mt-1 block w-full rounded-md ${darkMode ? 
          "border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" : 
          "border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"}`}
      >
        <option value="low">Низкий</option>
        <option value="medium">Средний</option>
        <option value="high">Высокий</option>
      </select>
    </div>

    <div>
      <label for="dueDate" class={darkMode ? "block text-sm font-medium text-gray-300" : "block text-sm font-medium text-gray-700"}>Срок выполнения <span class="text-red-500" aria-hidden="true">*</span></label>
      <input
        type="date"
        id="dueDate"
        name="dueDate"
        required
        aria-required="true"
        aria-invalid={formErrors.dueDate ? 'true' : 'false'}
        aria-describedby={formErrors.dueDate ? 'dueDate-error' : undefined}
        class={`mt-1 block w-full rounded-md ${formErrors.dueDate ? (darkMode ? 'border-red-500' : 'border-red-500') : (darkMode ? 'border-gray-600' : 'border-gray-300')} ${darkMode ? 
          "bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" : 
          "bg-gray-100 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"}`}
      />
      {#if formErrors.dueDate}
        <p id="dueDate-error" class={darkMode ? "mt-1 text-sm text-red-400" : "mt-1 text-sm text-red-600"} transition:fade={{ duration: 200 }}>
          {formErrors.dueDate}
        </p>
      {/if}
    </div>

    <div transition:fade={{ duration: 200 }}>
      <button
        type="submit"
        disabled={formSubmitting}
        class={darkMode ? 
          "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200" : 
          "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"}
        aria-busy={formSubmitting}
      >
        {formSubmitting ? 'Создание...' : 'Создать задачу'}
      </button>
    </div>
  </form>
  
  <div id="task-form-announcement" class="sr-only" aria-live="polite"></div>
</div> 