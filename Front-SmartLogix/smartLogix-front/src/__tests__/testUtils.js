import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Envuelve un componente con los proveedores necesarios para testing
 */
export function renderWithProviders(component, options = {}) {
  const {
    initialState = {},
    ...renderOptions
  } = options;

  function Wrapper({ children }) {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return render(component, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Helper para esperar a que un elemento esté en el documento
 */
export function waitForElement(testId) {
  return screen.findByTestId(testId);
}
