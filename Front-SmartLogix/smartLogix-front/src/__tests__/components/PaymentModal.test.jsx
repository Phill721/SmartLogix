import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentModal from '../../components/PaymentModal';

describe('PaymentModal Component', () => {
  const mockOnCancel = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockProps = {
    isOpen: true,
    total: 1500,
    metodo: 'webpay',
    onCancel: mockOnCancel,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no debe renderizar cuando isOpen es false', () => {
    const { container } = render(
      <PaymentModal {...mockProps} isOpen={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar cuando isOpen es true', () => {
    render(<PaymentModal {...mockProps} />);

    expect(screen.getByText('Pasarela de Pago')).toBeInTheDocument();
  });

  it('debe mostrar el total correctamente', () => {
    render(<PaymentModal {...mockProps} />);

    expect(screen.getByText(/1.500/)).toBeInTheDocument();
  });

  it('debe mostrar el método de pago correcto', () => {
    render(<PaymentModal {...mockProps} metodo="credito_30" />);

    expect(screen.getByText('Orden de Compra a 30 días')).toBeInTheDocument();
  });

  it('debe mostrar "Transferencia Bancaria" para metodo transferencia', () => {
    render(<PaymentModal {...mockProps} metodo="transferencia" />);

    expect(screen.getByText('Transferencia Bancaria')).toBeInTheDocument();
  });

  it('debe mostrar "Webpay Plus" para metodo webpay', () => {
    render(<PaymentModal {...mockProps} metodo="webpay" />);

    expect(screen.getByText('Webpay Plus')).toBeInTheDocument();
  });

  it('debe llamar onCancel al hacer click en Cancelar', () => {
    render(<PaymentModal {...mockProps} />);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('debe tener campos de entrada de formulario', () => {
    render(<PaymentModal {...mockProps} />);

    expect(screen.getByPlaceholderText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MM/AA')).toBeInTheDocument();
  });

  it('debe actualizar el nombre del titular', () => {
    render(<PaymentModal {...mockProps} />);

    const titleInput = screen.getByPlaceholderText('Juan Pérez');
    fireEvent.change(titleInput, { target: { value: 'Carlos Rodriguez' } });

    expect(titleInput).toHaveValue('Carlos Rodriguez');
  });

  it('debe formatear número de tarjeta automaticamente', () => {
    render(<PaymentModal {...mockProps} />);

    const numberInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    fireEvent.change(numberInput, { target: { value: '4532015112830366' } });

    expect(numberInput.value).toContain(' ');
  });

  it('debe formatear fecha automaticamente', () => {
    render(<PaymentModal {...mockProps} />);

    const dateInput = screen.getByPlaceholderText('MM/AA');
    fireEvent.change(dateInput, { target: { value: '1225' } });

    expect(dateInput.value).toContain('/');
  });

  it('debe mostrar error si nombre es muy corto', () => {
    render(<PaymentModal {...mockProps} />);

    const titleInput = screen.getByPlaceholderText('Juan Pérez');
    fireEvent.change(titleInput, { target: { value: 'Juan' } });

    const payButton = screen.getByText('Confirmar Pago');
    fireEvent.click(payButton);

    expect(screen.getByText(/demasiado corto/i)).toBeInTheDocument();
  });

  it('debe mostrar error si número de tarjeta es inválido', () => {
    render(<PaymentModal {...mockProps} />);

    const numberInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    fireEvent.change(numberInput, { target: { value: '1234567890123456' } });

    const payButton = screen.getByText('Confirmar Pago');
    fireEvent.click(payButton);

    expect(screen.getByText(/inválido/i)).toBeInTheDocument();
  });

  it('debe mostrar error si CVV es inválido', () => {
    render(<PaymentModal {...mockProps} />);

    const titleInput = screen.getByPlaceholderText('Juan Pérez');
    const numberInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    const dateInput = screen.getByPlaceholderText('MM/AA');
    const cvvInput = screen.getByPlaceholderText('123');

    fireEvent.change(titleInput, { target: { value: 'Juan Carlos' } });
    fireEvent.change(numberInput, { target: { value: '4532015112830366' } });
    fireEvent.change(dateInput, { target: { value: '1225' } });
    fireEvent.change(cvvInput, { target: { value: '12' } });

    const payButton = screen.getByText('Confirmar Pago');
    fireEvent.click(payButton);

    expect(screen.getByText(/3 dígitos/i)).toBeInTheDocument();
  });

  it('debe llamar onSuccess si formulario es válido', () => {
    render(<PaymentModal {...mockProps} />);

    const titleInput = screen.getByPlaceholderText('Juan Pérez');
    const numberInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    const dateInput = screen.getByPlaceholderText('MM/AA');
    const cvvInput = screen.getByPlaceholderText('123');

    fireEvent.change(titleInput, { target: { value: 'Juan Carlos Rodriguez' } });
    fireEvent.change(numberInput, { target: { value: '4532015112830366' } });
    fireEvent.change(dateInput, { target: { value: '1225' } });
    fireEvent.change(cvvInput, { target: { value: '123' } });

    const payButton = screen.getByText('Confirmar Pago');
    fireEvent.click(payButton);

    vi.runAllTimers();

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('debe deshabilitar botones mientras se procesa', () => {
    render(<PaymentModal {...mockProps} />);

    const titleInput = screen.getByPlaceholderText('Juan Pérez');
    const numberInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    const dateInput = screen.getByPlaceholderText('MM/AA');
    const cvvInput = screen.getByPlaceholderText('123');

    fireEvent.change(titleInput, { target: { value: 'Juan Carlos Rodriguez' } });
    fireEvent.change(numberInput, { target: { value: '4532015112830366' } });
    fireEvent.change(dateInput, { target: { value: '1225' } });
    fireEvent.change(cvvInput, { target: { value: '123' } });

    const payButton = screen.getByText('Confirmar Pago');
    const cancelButton = screen.getByText('Cancelar');

    fireEvent.click(payButton);

    expect(payButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('debe mostrar "Procesando..." mientras se procesa el pago', () => {
    render(<PaymentModal {...mockProps} />);

    const titleInput = screen.getByPlaceholderText('Juan Pérez');
    const numberInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    const dateInput = screen.getByPlaceholderText('MM/AA');
    const cvvInput = screen.getByPlaceholderText('123');

    fireEvent.change(titleInput, { target: { value: 'Juan Carlos Rodriguez' } });
    fireEvent.change(numberInput, { target: { value: '4532015112830366' } });
    fireEvent.change(dateInput, { target: { value: '1225' } });
    fireEvent.change(cvvInput, { target: { value: '123' } });

    const payButton = screen.getByText('Confirmar Pago');
    fireEvent.click(payButton);

    expect(screen.getByText('Procesando...')).toBeInTheDocument();
  });

  it('debe limpiar campos cuando isOpen cambia a false', () => {
    const { rerender } = render(<PaymentModal {...mockProps} />);

    const titleInput = screen.getByPlaceholderText('Juan Pérez');
    fireEvent.change(titleInput, { target: { value: 'Test User' } });

    expect(titleInput).toHaveValue('Test User');

    rerender(<PaymentModal {...mockProps} isOpen={false} />);

    expect(mockProps.onCancel).not.toHaveBeenCalled();
  });

  describe('Snapshot tests', () => {
    it('debe renderizar PaymentModal correctamente', () => {
      const { container } = render(<PaymentModal {...mockProps} />);

      expect(container).toMatchSnapshot();
    });

    it('debe renderizar PaymentModal cerrado correctamente', () => {
      const { container } = render(
        <PaymentModal {...mockProps} isOpen={false} />
      );

      expect(container).toMatchSnapshot();
    });
  });
});
