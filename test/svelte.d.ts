declare module '*.svelte' {
  import type { ComponentType } from 'svelte';
  const component: ComponentType;
  export default component;
}

declare module '@testing-library/jest-dom/matchers' {
  export * from '@testing-library/jest-dom';
}

declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining {
      toBeInTheDocument(): void;
      toHaveTextContent(text: string | RegExp): void;
      toBeVisible(): void;
      toBeDisabled(): void;
      toBeEnabled(): void;
      toBeChecked(): void;
      toHaveAttribute(attr: string, value?: string): void;
    }

    interface Assertion {
      toBeInTheDocument(): void;
      toHaveTextContent(text: string | RegExp): void;
      toBeVisible(): void;
      toBeDisabled(): void;
      toBeEnabled(): void;
      toBeChecked(): void;
      toHaveAttribute(attr: string, value?: string): void;
    }
  }
} 