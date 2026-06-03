package com.rifas.BackRifas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.rifas.BackRifas.model.EstadoVenta;

public class GrupoBoletoDTO {
    private Long id;
    private Long rifaId;
    private String nombre;
    private List<BoletoDTO> boletos;
    private BigDecimal valor;
    private EstadoVenta estadoVenta;
    private String compradorNombre;
    private String compradorTelefono;
    private Long vendedorId;
    private String vendedorNombre;
    private LocalDateTime fechaVenta;
    private BigDecimal montoAbonado;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public GrupoBoletoDTO() {}

    public GrupoBoletoDTO(Long id, Long rifaId, String nombre, List<BoletoDTO> boletos, 
                         BigDecimal valor, EstadoVenta estadoVenta, String compradorNombre,
                         String compradorTelefono, Long vendedorId, String vendedorNombre,
                         LocalDateTime fechaVenta, BigDecimal montoAbonado) {
        this.id = id;
        this.rifaId = rifaId;
        this.nombre = nombre;
        this.boletos = boletos;
        this.valor = valor;
        this.estadoVenta = estadoVenta;
        this.compradorNombre = compradorNombre;
        this.compradorTelefono = compradorTelefono;
        this.vendedorId = vendedorId;
        this.vendedorNombre = vendedorNombre;
        this.fechaVenta = fechaVenta;
        this.montoAbonado = montoAbonado;
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

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public List<BoletoDTO> getBoletos() {
        return boletos;
    }

    public void setBoletos(List<BoletoDTO> boletos) {
        this.boletos = boletos;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public EstadoVenta getEstadoVenta() {
        return estadoVenta;
    }

    public void setEstadoVenta(EstadoVenta estadoVenta) {
        this.estadoVenta = estadoVenta;
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
