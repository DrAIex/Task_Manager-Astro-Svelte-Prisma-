import { expect, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

beforeAll(() => {
  if (typeof Element !== 'undefined' && !Element.prototype.animate) {
    // @ts-ignore
    Element.prototype.animate = function() {
      return {
        cancel: () => {},
        finished: Promise.resolve(),
        onfinish: null,
        oncancel: null,
        pause: () => {},
        play: () => {},
        reverse: () => {},
      };
    };
  }
  
  if (typeof window !== 'undefined' && !window.localStorage) {
    const storage: Record<string, string> = {};
    // @ts-ignore
    window.localStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => { storage[key] = value.toString(); },
      removeItem: (key: string) => { delete storage[key]; },
      clear: () => { Object.keys(storage).forEach(key => { delete storage[key]; }); },
      key: (i: number) => Object.keys(storage)[i] || null,
      length: 0
    };
    
    Object.defineProperty(window.localStorage, 'length', {
      get: () => Object.keys(storage).length
    });
  }
  
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'function') {
    // @ts-ignore
    window.CustomEvent = function(event: string, params?: any) {
      params = params || { bubbles: false, cancelable: false, detail: null };
      const evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };
  }
});

afterEach(() => {
  cleanup();
}); 