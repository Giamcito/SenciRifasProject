package com.rifas.BackRifas.dto;

import java.time.LocalDateTime;

import com.rifas.BackRifas.model.EstadoVenta;

public class BoletoDTO {
    private Long id;
    private Long rifaId;
    private String numero;
    private EstadoVenta estadoVenta;
    private String compradorEmail;
    private LocalDateTime fechaVenta;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BoletoDTO() {}

    public BoletoDTO(Long id, Long rifaId, String numero, EstadoVenta estadoVenta, 
                     String compradorEmail, LocalDateTime fechaVenta, 
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.rifaId = rifaId;
        this.numero = numero;
        this.estadoVenta = estadoVenta;
        this.compradorEmail = compradorEmail;
        this.fechaVenta = fechaVenta;
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

    public String getCompradorEmail() {
        return compradorEmail;
    }

    public void setCompradorEmail(String compradorEmail) {
        this.compradorEmail = compradorEmail;
    }

    public LocalDateTime getFechaVenta() {
        return fechaVenta;
    }

    public void setFechaVenta(LocalDateTime fechaVenta) {
        this.fechaVenta = fechaVenta;
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
