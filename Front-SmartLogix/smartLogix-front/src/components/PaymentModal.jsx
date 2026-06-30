import React, { useEffect, useState } from "react";
import { theme } from "../theme/colors";
import {
    validarNombreTitular,
    validarNumeroTarjeta,
    validarCVV,
    validarFechaExpiracion,
    formatearNumeroTarjeta,
    formatearFecha,
} from "../utils/paymentValidation";

export default function PaymentModal({
    isOpen,
    total,
    metodo,
    onCancel,
    onSuccess,
}) {
    const [titular, setTitular] = useState("");
    const [numero, setNumero] = useState("");
    const [fecha, setFecha] = useState("");
    const [cvv, setCvv] = useState("");

    const [errores, setErrores] = useState({});
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTitular("");
            setNumero("");
            setFecha("");
            setCvv("");
            setErrores({});
            setProcesando(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const validarFormulario = () => {
        const nuevosErrores = {};

        const errNombre = validarNombreTitular(titular);
        if (errNombre) nuevosErrores.titular = errNombre;

        const errNumero = validarNumeroTarjeta(numero);
        if (errNumero) nuevosErrores.numero = errNumero;

        const errFecha = validarFechaExpiracion(fecha);
        if (errFecha) nuevosErrores.fecha = errFecha;

        const errCVV = validarCVV(cvv);
        if (errCVV) nuevosErrores.cvv = errCVV;

        setErrores(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    const handlePagar = async () => {
        if (!validarFormulario()) return;

        setProcesando(true);

        await new Promise((resolve) =>
            setTimeout(resolve, 1800)
        );

        setProcesando(false);

        onSuccess();
    };

    const nombreMetodo = () => {
        switch (metodo) {
            case "transferencia":
                return "Transferencia Bancaria";

            case "credito_30":
                return "Orden de Compra a 30 días";

            default:
                return "Webpay Plus";
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-5">

            <div
                className="w-full max-w-xl bg-white rounded-3xl border-2 shadow-2xl overflow-hidden animate-[fadeIn_.2s]"
                style={{
                    borderColor: theme.borderDark,
                }}
            >

                <div
                    className="px-8 py-6 text-white"
                    style={{
                        backgroundColor: theme.primary,
                    }}
                >

                    <h2 className="text-2xl font-black uppercase tracking-wider">
                        Pasarela de Pago
                    </h2>

                    <p className="text-sm opacity-90 mt-1">
                        Simulación de pago SmartLogix
                    </p>

                </div>

                <div className="p-8 space-y-6">

                    <div className="rounded-2xl border bg-slate-50 p-5">

                        <div className="flex justify-between mb-2">

                            <span className="font-bold text-sm">
                                Método
                            </span>

                            <span className="font-bold">
                                {nombreMetodo()}
                            </span>

                        </div>

                        <div className="flex justify-between">

                            <span className="font-bold text-sm">
                                Total
                            </span>

                            <span
                                className="text-xl font-black"
                                style={{
                                    color: theme.primary,
                                }}
                            >
                                ${total.toLocaleString("es-CL")}
                            </span>

                        </div>

                    </div>

                    <div
                        className="rounded-3xl p-6 text-white shadow-lg"
                        style={{
                            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                        }}
                    >

                        <div className="flex justify-between">

                            <span className="text-sm opacity-80">
                                SmartLogix Bank
                            </span>

                            <span className="font-black">
                                VISA
                            </span>

                        </div>

                        <div className="mt-8 font-mono tracking-[4px] text-xl">

                            {numero || "#### #### #### ####"}

                        </div>

                        <div className="flex justify-between mt-8">

                            <div>

                                <p className="text-[10px] opacity-70">
                                    TITULAR
                                </p>

                                <p className="font-semibold">

                                    {titular || "NOMBRE APELLIDO"}

                                </p>

                            </div>

                            <div>

                                <p className="text-[10px] opacity-70">
                                    EXP
                                </p>

                                <p>

                                    {fecha || "MM/AA"}

                                </p>

                            </div>

                        </div>

                    </div>

                    <div>

                        <label className="block text-xs font-black uppercase mb-2">
                            Nombre del titular
                        </label>

                        <input
                            type="text"
                            value={titular}
                            onChange={(e) => setTitular(e.target.value)}
                            className="w-full rounded-xl border-2 px-4 py-3 outline-none"
                            placeholder="Juan Pérez"
                        />

                        {errores.titular && (
                            <p className="text-red-600 text-xs mt-1">
                                {errores.titular}
                            </p>
                        )}

                    </div>
                    <div>

                        <label className="block text-xs font-black uppercase mb-2">
                            Número de tarjeta
                        </label>

                        <input
                            type="text"
                            value={numero}
                            maxLength={19}
                            onChange={(e) =>
                                setNumero(formatearNumeroTarjeta(e.target.value))
                            }
                            placeholder="1234 5678 9012 3456"
                            className="w-full rounded-xl border-2 px-4 py-3 outline-none font-mono"
                        />

                        {errores.numero && (
                            <p className="text-red-600 text-xs mt-1">
                                {errores.numero}
                            </p>
                        )}

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                        <div>

                            <label className="block text-xs font-black uppercase mb-2">
                                Expiración
                            </label>

                            <input
                                type="text"
                                maxLength={5}
                                value={fecha}
                                onChange={(e) =>
                                    setFecha(formatearFecha(e.target.value))
                                }
                                placeholder="MM/AA"
                                className="w-full rounded-xl border-2 px-4 py-3 outline-none font-mono"
                            />

                            {errores.fecha && (
                                <p className="text-red-600 text-xs mt-1">
                                    {errores.fecha}
                                </p>
                            )}

                        </div>

                        <div>

                            <label className="block text-xs font-black uppercase mb-2">
                                CVV
                            </label>

                            <input
                                type="password"
                                value={cvv}
                                maxLength={4}
                                onChange={(e) =>
                                    setCvv(e.target.value.replace(/\D/g, ""))
                                }
                                placeholder="123"
                                className="w-full rounded-xl border-2 px-4 py-3 outline-none font-mono"
                            />

                            {errores.cvv && (
                                <p className="text-red-600 text-xs mt-1">
                                    {errores.cvv}
                                </p>
                            )}

                        </div>

                    </div>

                </div>

                <div className="flex justify-end gap-4 px-8 pb-8">

                    <button
                        type="button"
                        disabled={procesando}
                        onClick={onCancel}
                        className="px-6 py-3 rounded-full border-2 font-bold transition hover:bg-slate-100 disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        disabled={procesando}
                        onClick={handlePagar}
                        className="px-8 py-3 rounded-full text-white font-black shadow-lg transition hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                        style={{
                            backgroundColor: theme.primary,
                        }}
                    >
                        {procesando ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Procesando...
                            </>
                        ) : (
                            <>
                                Confirmar Pago
                            </>
                        )}
                    </button>

                </div>

            </div>

        </div>
    );
}