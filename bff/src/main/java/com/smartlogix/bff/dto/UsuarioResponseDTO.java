package com.smartlogix.bff.dto;

import java.time.LocalDateTime;

public class UsuarioResponseDTO {

    private Long id;

    private String nombre;

    private String email;

    private String rol;

    private Boolean adminBase;

    private Boolean esActivo;

    private String estadoBloqueo;

    private LocalDateTime fechaBloqueoTemporal;

    private Integer intentosFallidos;

    private LocalDateTime tokensInvalidosDesde;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public Boolean getAdminBase() {
        return adminBase;
    }

    public void setAdminBase(Boolean adminBase) {
        this.adminBase = adminBase;
    }

    public Boolean getEsActivo() {
        return esActivo;
    }

    public void setEsActivo(Boolean esActivo) {
        this.esActivo = esActivo;
    }

    public String getEstadoBloqueo() {
        return estadoBloqueo;
    }

    public void setEstadoBloqueo(String estadoBloqueo) {
        this.estadoBloqueo = estadoBloqueo;
    }

    public LocalDateTime getFechaBloqueoTemporal() {
        return fechaBloqueoTemporal;
    }

    public void setFechaBloqueoTemporal(LocalDateTime fechaBloqueoTemporal) {
        this.fechaBloqueoTemporal = fechaBloqueoTemporal;
    }

    public Integer getIntentosFallidos() {
        return intentosFallidos;
    }

    public void setIntentosFallidos(Integer intentosFallidos) {
        this.intentosFallidos = intentosFallidos;
    }

    public LocalDateTime getTokensInvalidosDesde() {
        return tokensInvalidosDesde;
    }

    public void setTokensInvalidosDesde(LocalDateTime tokensInvalidosDesde) {
        this.tokensInvalidosDesde = tokensInvalidosDesde;
    }
}