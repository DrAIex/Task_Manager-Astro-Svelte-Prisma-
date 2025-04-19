<script>
  import { onMount } from 'svelte';
  
  export let darkMode = false;
  
  let canvas;
  let ctx;
  let animationId;
  let particles = [];

  const PARTICLE_COUNT = 50;
  const PARTICLE_SIZE_MIN = 2;
  const PARTICLE_SIZE_MAX = 6;
  const PARTICLE_SPEED_MIN = 0.2;
  const PARTICLE_SPEED_MAX = 0.8;

  let prefersReducedMotion = false;
  
  onMount(() => {
    if (typeof window !== 'undefined') {

      prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      darkMode = localStorage.getItem('darkMode') === 'true';

      window.addEventListener('themeChanged', (event) => {
        darkMode = event.detail.darkMode;
      });

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleReducedMotionChange = (e) => {
        prefersReducedMotion = e.matches;
        if (prefersReducedMotion && animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        } else if (!prefersReducedMotion && !animationId) {
          animate();
        }
      };
      
      mediaQuery.addEventListener('change', handleReducedMotionChange);
      
      initCanvas();

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        window.removeEventListener('themeChanged', (event) => {
          darkMode = event.detail.darkMode;
        });
        mediaQuery.removeEventListener('change', handleReducedMotionChange);
      };
    }
  });
  
  $: if (typeof window !== 'undefined' && ctx) {

    updateParticleColors(darkMode);
  }
  
  function initCanvas() {
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    createParticles();

    if (!prefersReducedMotion) {
      animate();
    } else {

      drawStaticBackground();
    }
  }
  
  function resizeCanvas() {
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (particles.length > 0) {
      createParticles();
    }

    if (prefersReducedMotion) {
      drawStaticBackground();
    }
  }
  
  function createParticles() {
    particles = [];
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: PARTICLE_SIZE_MIN + Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN),
        speedX: (Math.random() - 0.5) * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN),
        speedY: (Math.random() - 0.5) * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN),
        color: getParticleColor(darkMode),
        opacity: 0.1 + Math.random() * 0.4
      });
    }
  }
  
  function updateParticleColors(isDark) {
    for (let p of particles) {
      p.color = getParticleColor(isDark);
    }

    if (prefersReducedMotion) {
      drawStaticBackground();
    }
  }
  
  function getParticleColor(isDark) {
    if (isDark) {
      return `red`;
    } else {
      return `purple`;
    }
  }
  
  function animate() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawParticles();
    updateParticles();

    drawConnections();

    animationId = requestAnimationFrame(animate);
  }
  
  function drawStaticBackground() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawParticles();

    drawConnections();
  }
  
  function drawParticles() {
    for (let p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  
  function updateParticles() {
    for (let p of particles) {

      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0 || p.x > canvas.width) {
        p.speedX = -p.speedX;
      }
      
      if (p.y < 0 || p.y > canvas.height) {
        p.speedY = -p.speedY;
      }
    }
  }
  
  function drawConnections() {

    const maxDistance = 150;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {

          const opacity = (1 - distance / maxDistance) * 0.3;
          
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);

          const gradient = ctx.createLinearGradient(
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y
          );
          gradient.addColorStop(0, particles[i].color);
          gradient.addColorStop(1, particles[j].color);
          
          ctx.strokeStyle = gradient;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  }
</script>

<canvas
  bind:this={canvas}
  class="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
  aria-hidden="true"
  role="presentation"
  tabindex="-1"
></canvas> 