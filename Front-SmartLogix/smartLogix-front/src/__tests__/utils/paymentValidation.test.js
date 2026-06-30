import { describe, it, expect } from 'vitest';
import {
  validarNumeroTarjeta,
  validarNombreTitular,
  validarCVV,
  validarFechaExpiracion,
  validarFormularioPago,
  formatearNumeroTarjeta,
  formatearFecha,
} from '../../utils/paymentValidation';

describe('paymentValidation Utils', () => {
  describe('validarNumeroTarjeta', () => {
    it('debe validar un número de tarjeta válido', () => {
      const resultado = validarNumeroTarjeta('4532015112830366');
      expect(resultado).toBe('');
    });

    it('debe rechazar números con menos de 16 dígitos', () => {
      const resultado = validarNumeroTarjeta('453201511283036');
      expect(resultado).toContain('16 dígitos');
    });

    it('debe rechazar números con más de 16 dígitos', () => {
      const resultado = validarNumeroTarjeta('45320151128303665');
      expect(resultado).toContain('16 dígitos');
    });

    it('debe rechazar números con caracteres no numéricos', () => {
      const resultado = validarNumeroTarjeta('453a-0151-1283-0366');
      expect(resultado).toContain('16 dígitos');
    });

    it('debe aceptar números con espacios', () => {
      const resultado = validarNumeroTarjeta('4532 0151 1283 0366');
      expect(resultado).toBe('');
    });

    it('debe rechazar números que no pasan el algoritmo de Luhn', () => {
      const resultado = validarNumeroTarjeta('1234567890123456');
      expect(resultado).toContain('inválido');
    });

    it('debe ignorar espacios en números', () => {
      const resultado = validarNumeroTarjeta('4532 0151 1283 0366');
      expect(resultado).toBe('');
    });
  });

  describe('validarNombreTitular', () => {
    it('debe validar un nombre válido', () => {
      const resultado = validarNombreTitular('Juan Perez');
      expect(resultado).toBe('');
    });

    it('debe rechazar nombres vacíos', () => {
      const resultado = validarNombreTitular('');
      expect(resultado).toContain('Ingrese');
    });

    it('debe rechazar nombres solo con espacios', () => {
      const resultado = validarNombreTitular('   ');
      expect(resultado).toContain('Ingrese');
    });

    it('debe rechazar nombres muy cortos', () => {
      const resultado = validarNombreTitular('Juan');
      expect(resultado).toContain('demasiado corto');
    });

    it('debe aceptar nombres de 5 caracteres', () => {
      const resultado = validarNombreTitular('Pedro');
      expect(resultado).toBe('');
    });

    it('debe aceptar nombres largos', () => {
      const resultado = validarNombreTitular('Juan Carlos Perez Rodriguez');
      expect(resultado).toBe('');
    });
  });

  describe('validarCVV', () => {
    it('debe validar un CVV válido', () => {
      const resultado = validarCVV('123');
      expect(resultado).toBe('');
    });

    it('debe rechazar CVV con menos de 3 dígitos', () => {
      const resultado = validarCVV('12');
      expect(resultado).toContain('3 dígitos');
    });

    it('debe rechazar CVV con más de 3 dígitos', () => {
      const resultado = validarCVV('1234');
      expect(resultado).toContain('3 dígitos');
    });

    it('debe rechazar CVV vacío', () => {
      const resultado = validarCVV('');
      expect(resultado).toContain('3 dígitos');
    });

    it('debe rechazar CVV con caracteres no numéricos', () => {
      const resultado = validarCVV('12a');
      expect(resultado).toContain('3 dígitos');
    });
  });

  describe('validarFechaExpiracion', () => {
    it('debe validar una fecha futura válida', () => {
      const proximoAnio = (new Date().getFullYear() + 1).toString().slice(-2);
      const resultado = validarFechaExpiracion(`06/${proximoAnio}`);
      expect(resultado).toBe('');
    });

    it('debe rechazar formato incorrecto', () => {
      const resultado = validarFechaExpiracion('06-2025');
      expect(resultado).toContain('Formato inválido');
    });

    it('debe rechazar mes inválido (0)', () => {
      const resultado = validarFechaExpiracion('00/25');
      expect(resultado).toContain('Mes inválido');
    });

    it('debe rechazar mes inválido (13)', () => {
      const resultado = validarFechaExpiracion('13/25');
      expect(resultado).toContain('Mes inválido');
    });

    it('debe rechazar tarjetas vencidas', () => {
      const resultado = validarFechaExpiracion('06/20');
      expect(resultado).toContain('vencida');
    });

    it('debe aceptar fecha vigente', () => {
      const mesActual = String(new Date().getMonth() + 1).padStart(2, '0');
      const anioActual = new Date().getFullYear().toString().slice(-2);
      const resultado = validarFechaExpiracion(`${mesActual}/${anioActual}`);
      expect(resultado).toBe('');
    });
  });

  describe('validarFormularioPago', () => {
    it('debe validar un formulario completo válido', () => {
      const proximoAnio = (new Date().getFullYear() + 1).toString().slice(-2);
      const data = {
        numero: '4532015112830366',
        nombre: 'Juan Perez',
        fecha: `06/${proximoAnio}`,
        cvv: '123',
      };
      const errores = validarFormularioPago(data);
      expect(Object.keys(errores)).toHaveLength(0);
    });

    it('debe retornar errores para campos inválidos', () => {
      const data = {
        numero: '1234567890123456',
        nombre: 'Juan',
        fecha: '13/25',
        cvv: '12',
      };
      const errores = validarFormularioPago(data);
      expect(Object.keys(errores)).toContain('numero');
      expect(Object.keys(errores)).toContain('nombre');
      expect(Object.keys(errores)).toContain('fecha');
      expect(Object.keys(errores)).toContain('cvv');
    });

    it('debe retornar un objeto vacío si todo es válido', () => {
      const proximoAnio = (new Date().getFullYear() + 1).toString().slice(-2);
      const data = {
        numero: '4532015112830366',
        nombre: 'Carlos Miguel',
        fecha: `12/${proximoAnio}`,
        cvv: '456',
      };
      const errores = validarFormularioPago(data);
      expect(errores).toEqual({});
    });
  });

  describe('formatearNumeroTarjeta', () => {
    it('debe formatear número de tarjeta con espacios', () => {
      const resultado = formatearNumeroTarjeta('4532015112830366');
      expect(resultado).toBe('4532 0151 1283 0366');
    });

    it('debe limitar a 16 dígitos', () => {
      const resultado = formatearNumeroTarjeta('45320151128303661234');
      expect(resultado.replace(/\s/g, '')).toHaveLength(16);
    });

    it('debe ignorar caracteres no numéricos', () => {
      const resultado = formatearNumeroTarjeta('4532-0151-1283-0366');
      expect(resultado).toBe('4532 0151 1283 0366');
    });

    it('debe retornar cadena vacía para entrada vacía', () => {
      const resultado = formatearNumeroTarjeta('');
      expect(resultado).toBe('');
    });
  });

  describe('formatearFecha', () => {
    it('debe formatear fecha como MM/AA', () => {
      const resultado = formatearFecha('0625');
      expect(resultado).toBe('06/25');
    });

    it('debe limitar a 4 dígitos', () => {
      const resultado = formatearFecha('062525');
      expect(resultado.replace(/\D/g, '')).toHaveLength(4);
    });

    it('debe retornar solo mes si hay menos de 3 dígitos', () => {
      const resultado = formatearFecha('06');
      expect(resultado).toBe('06');
    });

    it('debe ignorar caracteres no numéricos', () => {
      const resultado = formatearFecha('06-25');
      expect(resultado).toBe('06/25');
    });

    it('debe retornar cadena vacía para entrada vacía', () => {
      const resultado = formatearFecha('');
      expect(resultado).toBe('');
    });
  });
});
