<script>
  import { onMount } from 'svelte';
  
  let darkMode = true;
  
  onMount(() => {
    darkMode = localStorage.getItem('darkMode') === 'true';
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  });
  
  function toggleDarkMode() {
    darkMode = !darkMode;
    
    localStorage.setItem('darkMode', darkMode);
    
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
    
    const announcement = document.getElementById('theme-announcement');
    if (announcement) {
      announcement.textContent = darkMode ? 'Включена темная тема' : 'Включена светлая тема';
    }
  }
</script>

<button 
  class={`
    flex items-center justify-center p-2 ml-2 rounded-full
    ${darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-white'}
    transition-all duration-300 hover:opacity-90 focus:outline-none
  `}
  on:click={toggleDarkMode}
  aria-label={darkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
  aria-pressed={darkMode}
  title={darkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
>
  {#if darkMode}
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  {/if}
</button>

<div id="theme-announcement" class="sr-only" aria-live="polite"></div> 