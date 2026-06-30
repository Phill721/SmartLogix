// src/utils/paymentValidation.js

export function validarNumeroTarjeta(numero) {
    const limpio = numero.replace(/\s+/g, "");

    if (!/^\d{16}$/.test(limpio)) {
        return "El número de tarjeta debe tener 16 dígitos.";
    }

    // Algoritmo de Luhn
    let suma = 0;
    let alternar = false;

    for (let i = limpio.length - 1; i >= 0; i--) {
        let n = parseInt(limpio.charAt(i), 10);

        if (alternar) {
            n *= 2;
            if (n > 9) {
                n -= 9;
            }
        }

        suma += n;
        alternar = !alternar;
    }

    if (suma % 10 !== 0) {
        return "Número de tarjeta inválido.";
    }

    return "";
}

export function validarNombreTitular(nombre) {
    if (!nombre.trim()) {
        return "Ingrese el nombre del titular.";
    }

    if (nombre.trim().length < 5) {
        return "El nombre es demasiado corto.";
    }

    return "";
}

export function validarCVV(cvv) {
    if (!/^\d{3}$/.test(cvv)) {
        return "El CVV debe tener 3 dígitos.";
    }

    return "";
}

export function validarFechaExpiracion(fecha) {
    if (!/^\d{2}\/\d{2}$/.test(fecha)) {
        return "Formato inválido. Use MM/AA.";
    }

    const [mes, anio] = fecha.split("/");

    const month = parseInt(mes, 10);
    const year = 2000 + parseInt(anio, 10);

    if (month < 1 || month > 12) {
        return "Mes inválido.";
    }

    // Primer día del mes siguiente
    const expiracion = new Date(year, month, 1);

    // Rechazar tarjetas vencidas.
    // Ejemplo:
    // hoy = 29/06/2026
    // 06/26 sigue siendo válida hasta el 30/06/2026
    const hoy = new Date();

    const limite = new Date(
        hoy.getFullYear(),
        hoy.getMonth() + 1,
        1
    );

    if (expiracion < limite) {
        return "La tarjeta está vencida.";
    }

    return "";
}

export function validarFormularioPago(data) {
    const errores = {};

    const errorNumero = validarNumeroTarjeta(data.numero);
    if (errorNumero) errores.numero = errorNumero;

    const errorNombre = validarNombreTitular(data.nombre);
    if (errorNombre) errores.nombre = errorNombre;

    const errorFecha = validarFechaExpiracion(data.fecha);
    if (errorFecha) errores.fecha = errorFecha;

    const errorCVV = validarCVV(data.cvv);
    if (errorCVV) errores.cvv = errorCVV;

    return errores;
}

export function formatearNumeroTarjeta(valor) {
    return valor
        .replace(/\D/g, "")
        .substring(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
}

export function formatearFecha(valor) {
    const numeros = valor.replace(/\D/g, "").substring(0, 4);

    if (numeros.length <= 2) {
        return numeros;
    }

    return `${numeros.substring(0, 2)}/${numeros.substring(2, 4)}`;
}