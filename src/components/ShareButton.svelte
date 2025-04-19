<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  export let title = "Поделиться задачей";
  export let text = "";
  export let url = "";
  export let darkMode = false;
  
  let isShareSupported = false;
  let shareResult = "";
  let showResultMessage = false;
  
  onMount(() => {
    isShareSupported = typeof navigator !== 'undefined' && !!navigator.share;
  });
  
  async function shareContent() {
    if (!isShareSupported) {

      try {
        await navigator.clipboard.writeText(url);
        showShareResult("Ссылка скопирована в буфер обмена");
      } catch (error) {
        showShareResult("Не удалось скопировать ссылку", true);
        console.error("Ошибка копирования ссылки:", error);
      }
      return;
    }
    
    try {
      await navigator.share({
        title,
        text,
        url
      });
      showShareResult("Успешно поделились");
    } catch (error) {

      if (error.name !== 'AbortError') {
        showShareResult("Не удалось поделиться", true);
        console.error("Ошибка при попытке поделиться:", error);
      }
    }
  }
  
  function showShareResult(message, isError = false) {
    shareResult = message;
    showResultMessage = true;

    setTimeout(() => {
      showResultMessage = false;
    }, 3000);
  }
</script>

<div>
  <button
    on:click={shareContent}
    class={`flex items-center space-x-1 px-3 py-1 text-xs rounded ${
      darkMode 
        ? 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800' 
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
    } transition-colors duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
    aria-label="Поделиться задачей"
    title={isShareSupported ? "Поделиться задачей" : "Скопировать ссылку на задачу"}
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      class="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
      <polyline points="16 6 12 2 8 6"></polyline>
      <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
    <span>{isShareSupported ? "Поделиться" : "Копировать ссылку"}</span>
  </button>
  
  {#if showResultMessage}
    <div 
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
      class={`mt-2 px-3 py-1 text-xs rounded-md fixed bottom-4 right-4 z-50 
        ${darkMode 
          ? shareResult.includes("Не удалось") 
            ? 'bg-red-900 text-red-200'
            : 'bg-green-900 text-green-200' 
          : shareResult.includes("Не удалось")
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        } shadow-lg`}
      role="status"
      aria-live="polite"
    >
      {shareResult}
    </div>
  {/if}
</div> 