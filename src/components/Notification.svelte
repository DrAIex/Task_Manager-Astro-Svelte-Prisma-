<script>
  import { onMount, createEventDispatcher } from 'svelte';
  
  export let message = '';
  export let type = 'success';
  export let duration = 3000;
  
  const dispatch = createEventDispatcher();
  let visible = true;
  
  onMount(() => {
    const timer = setTimeout(() => {
      closeNotification();
    }, duration);
    
    return () => clearTimeout(timer);
  });
  
  function closeNotification() {
    visible = false;
    setTimeout(() => {
      dispatch('close');
    }, 300);
  }
</script>

{#if visible}
  <div
    class={`notification notification-${type} ${visible ? 'animate-slide-in' : ''}`}
    style={visible ? 'opacity: 1; transform: translateY(0)' : 'opacity: 0; transform: translateY(-20px)'}
    role="alert"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        {#if type === 'success'}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        {/if}
        <span>{message}</span>
      </div>
      <button 
        on:click={closeNotification}
        class="ml-4 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Закрыть"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
{/if} 