package com.rifas.BackRifas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RifaDTO {
    private Long id;
    private String nombre;
    private Integer cantidadBoletos;
    private BigDecimal valorBoleto;
    private Long usuarioId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RifaDTO() {}

    public RifaDTO(Long id, String nombre, Integer cantidadBoletos, BigDecimal valorBoleto, Long usuarioId, 
                   LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.nombre = nombre;
        this.cantidadBoletos = cantidadBoletos;
        this.valorBoleto = valorBoleto;
        this.usuarioId = usuarioId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

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

    public Integer getCantidadBoletos() {
        return cantidadBoletos;
    }

    public void setCantidadBoletos(Integer cantidadBoletos) {
        this.cantidadBoletos = cantidadBoletos;
    }

    public BigDecimal getValorBoleto() {
        return valorBoleto;
    }

    public void setValorBoleto(BigDecimal valorBoleto) {
        this.valorBoleto = valorBoleto;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
