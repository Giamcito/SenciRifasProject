package com.rifas.BackRifas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.rifas.BackRifas.model.EstadoVenta;

public class BoletoDTO {
    private Long id;
    private Long rifaId;
    private String numero;
    private EstadoVenta estadoVenta;
    private Long vendedorId;
    private String vendedorNombre;
    private String compradorNombre;
    private String compradorTelefono;
    private LocalDateTime fechaVenta;
    private BigDecimal montoAbonado;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BoletoDTO() {}

    public BoletoDTO(Long id, Long rifaId, String numero, EstadoVenta estadoVenta,
                     Long vendedorId, String vendedorNombre,
                     String compradorNombre, String compradorTelefono, LocalDateTime fechaVenta, BigDecimal montoAbonado,
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.rifaId = rifaId;
        this.numero = numero;
        this.estadoVenta = estadoVenta;
        this.vendedorId = vendedorId;
        this.vendedorNombre = vendedorNombre;
        this.compradorNombre = compradorNombre;
        this.compradorTelefono = compradorTelefono;
        this.fechaVenta = fechaVenta;
        this.montoAbonado = montoAbonado;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRifaId() {
        return rifaId;
    }

    public void setRifaId(Long rifaId) {
        this.rifaId = rifaId;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public EstadoVenta getEstadoVenta() {
        return estadoVenta;
    }

    public void setEstadoVenta(EstadoVenta estadoVenta) {
        this.estadoVenta = estadoVenta;
    }

    public Long getVendedorId() {
        return vendedorId;
    }

    public void setVendedorId(Long vendedorId) {
        this.vendedorId = vendedorId;
    }

    public String getVendedorNombre() {
        return vendedorNombre;
    }

    public void setVendedorNombre(String vendedorNombre) {
        this.vendedorNombre = vendedorNombre;
    }

    public String getCompradorNombre() {
        return compradorNombre;
    }

    public void setCompradorNombre(String compradorNombre) {
        this.compradorNombre = compradorNombre;
    }

    public String getCompradorTelefono() {
        return compradorTelefono;
    }

    public void setCompradorTelefono(String compradorTelefono) {
        this.compradorTelefono = compradorTelefono;
    }

    public LocalDateTime getFechaVenta() {
        return fechaVenta;
    }

    public void setFechaVenta(LocalDateTime fechaVenta) {
        this.fechaVenta = fechaVenta;
    }

    public BigDecimal getMontoAbonado() {
        return montoAbonado;
    }

    public void setMontoAbonado(BigDecimal montoAbonado) {
        this.montoAbonado = montoAbonado;
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
