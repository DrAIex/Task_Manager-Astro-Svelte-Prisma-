import { cubicInOut, cubicOut } from 'svelte/easing';

/**
 * @param {Object} params
 * @param {number} params.delay
 * @param {number} params.duration
 */
export function scale(node, { delay = 0, duration = 300 }) {
  return {
    delay,
    duration,
    css: t => {
      const eased = cubicOut(t);
      return `
        transform: scale(${eased});
        opacity: ${eased};
      `;
    }
  };
}

/**
 * @param {Object} params
 * @param {number} params.delay
 * @param {number} params.duration
 * @param {number} params.y
 */
export function slideIn(node, { delay = 0, duration = 400, y = -20 }) {
  return {
    delay,
    duration,
    css: t => {
      const eased = cubicInOut(t);
      return `
        transform: translateY(${(1 - eased) * y}px);
        opacity: ${eased};
      `;
    }
  };
}

/**
 * @param {Object} params
 * @param {number} params.delay
 * @param {number} params.duration
 */
export function fade(node, { delay = 0, duration = 200 }) {
  return {
    delay,
    duration,
    css: t => `opacity: ${t}`
  };
}

/**
 * @param {Object} params
 * @param {number} params.delay
 * @param {number} params.duration
 */
export function modalFade(node, { delay = 0, duration = 300 }) {
  return {
    delay,
    duration,
    css: t => {
      const eased = cubicOut(t);
      return `
        transform: scale(${0.9 + eased * 0.1});
        opacity: ${eased};
      `;
    }
  };
}

/**
 * @param {Object} params
 * @param {number} params.delay
 * @param {number} params.duration
 * @param {number} params.x
 */
export function notificationSlide(node, { delay = 0, duration = 300, x = 20 }) {
  return {
    delay,
    duration,
    css: t => {
      const eased = cubicOut(t);
      return `
        transform: translateX(${(1 - eased) * x}px);
        opacity: ${eased};
      `;
    }
  };
} 