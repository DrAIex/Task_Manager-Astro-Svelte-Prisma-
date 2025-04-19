<script>
  import { onMount, onDestroy } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import { crossfade } from 'svelte/transition';
  
  export let key;
  export let duration = 500;
  
  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * duration),
    fallback(node) {
      const style = getComputedStyle(node);
      const transform = style.transform === 'none' ? '' : style.transform;
      
      return {
        duration,
        easing: quintOut,
        css: (t) => `
          transform: ${transform} scale(${t});
          opacity: ${t}
        `
      };
    }
  });
</script>

<div in:receive={{ key }} out:send={{ key }}>
  <slot />
</div> 