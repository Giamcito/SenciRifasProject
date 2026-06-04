package com.rifas.BackRifas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.rifas.BackRifas.model.EstadoVenta;

public class BoletoDTO {
    private Long id;
    private Long rifaId;
    private String numero;
    private EstadoVenta estadoVenta;
    private Long grupoId;
    private String grupoNombre;
    private EstadoVenta grupoEstadoVenta;
    private String grupoVendedorNombre;
    private BigDecimal grupoMontoAbonado;
    private BigDecimal grupoSaldoPendiente;
    private Long vendedorId;
    private String vendedorNombre;
    private String compradorNombre;
    private String compradorTelefono;
    private LocalDateTime fechaVenta;
    private BigDecimal montoAbonado;
    private Boolean descontarParteVendedor;
    private BigDecimal montoNeto;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BoletoDTO() {}

    public BoletoDTO(Long id, Long rifaId, String numero, EstadoVenta estadoVenta,
                     Long grupoId,
                     String grupoNombre,
                     EstadoVenta grupoEstadoVenta,
                     String grupoVendedorNombre,
                     BigDecimal grupoMontoAbonado,
                     BigDecimal grupoSaldoPendiente,
                     Long vendedorId, String vendedorNombre,
                     String compradorNombre, String compradorTelefono, LocalDateTime fechaVenta, BigDecimal montoAbonado,
                     Boolean descontarParteVendedor, BigDecimal montoNeto,
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.rifaId = rifaId;
        this.numero = numero;
        this.estadoVenta = estadoVenta;
        this.grupoId = grupoId;
        this.grupoNombre = grupoNombre;
        this.grupoEstadoVenta = grupoEstadoVenta;
        this.grupoVendedorNombre = grupoVendedorNombre;
        this.grupoMontoAbonado = grupoMontoAbonado;
        this.grupoSaldoPendiente = grupoSaldoPendiente;
        this.vendedorId = vendedorId;
        this.vendedorNombre = vendedorNombre;
        this.compradorNombre = compradorNombre;
        this.compradorTelefono = compradorTelefono;
        this.fechaVenta = fechaVenta;
        this.montoAbonado = montoAbonado;
        this.descontarParteVendedor = descontarParteVendedor;
        this.montoNeto = montoNeto;
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

    public Long getGrupoId() {
        return grupoId;
    }

    public void setGrupoId(Long grupoId) {
        this.grupoId = grupoId;
    }

    public String getGrupoNombre() {
        return grupoNombre;
    }

    public void setGrupoNombre(String grupoNombre) {
        this.grupoNombre = grupoNombre;
    }

    public EstadoVenta getGrupoEstadoVenta() {
        return grupoEstadoVenta;
    }

    public void setGrupoEstadoVenta(EstadoVenta grupoEstadoVenta) {
        this.grupoEstadoVenta = grupoEstadoVenta;
    }

    public String getGrupoVendedorNombre() {
        return grupoVendedorNombre;
    }

    public void setGrupoVendedorNombre(String grupoVendedorNombre) {
        this.grupoVendedorNombre = grupoVendedorNombre;
    }

    public BigDecimal getGrupoMontoAbonado() {
        return grupoMontoAbonado;
    }

    public void setGrupoMontoAbonado(BigDecimal grupoMontoAbonado) {
        this.grupoMontoAbonado = grupoMontoAbonado;
    }

    public BigDecimal getGrupoSaldoPendiente() {
        return grupoSaldoPendiente;
    }

    public void setGrupoSaldoPendiente(BigDecimal grupoSaldoPendiente) {
        this.grupoSaldoPendiente = grupoSaldoPendiente;
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

    public Boolean getDescontarParteVendedor() {
        return descontarParteVendedor;
    }

    public void setDescontarParteVendedor(Boolean descontarParteVendedor) {
        this.descontarParteVendedor = descontarParteVendedor;
    }

    public BigDecimal getMontoNeto() {
        return montoNeto;
    }

    public void setMontoNeto(BigDecimal montoNeto) {
        this.montoNeto = montoNeto;
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
