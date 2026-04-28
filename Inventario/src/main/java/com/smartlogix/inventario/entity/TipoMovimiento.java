package com.smartlogix.inventario.entity;

/**
 * Define los tipos de transacciones que pueden afectar el stock.
 * Se utiliza para mantener la trazabilidad en la tabla de movimientos.
 */
public enum TipoMovimiento {
    
    /** Registro por primera vez del producto en el sistema */
    INICIAL, 
    
    /** Cambios manuales realizados por un administrador (merma, error de conteo, etc.) */
    AJUSTE, 
    
    /** Stock bloqueado temporalmente mientras se procesa un pedido */
    RESERVA, 
    
    /** Retorno de stock reservado al estado disponible (por cancelación de pedido) */
    LIBERACION, 
    
    /** Salida definitiva de stock tras la confirmación de un pedido */
    VENTA
}