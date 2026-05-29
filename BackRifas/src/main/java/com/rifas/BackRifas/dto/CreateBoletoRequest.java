package com.rifas.BackRifas.dto;

import com.rifas.BackRifas.model.EstadoVenta;

import jakarta.validation.constraints.NotNull;

public class CreateBoletoRequest {
    @NotNull(message = "El estado de venta es requerido")
    private EstadoVenta estadoVenta;

    private Long vendedorId;
    private String vendedorNombre;
    private String compradorNombre;
    private String compradorTelefono;

    public CreateBoletoRequest() {}

    public CreateBoletoRequest(EstadoVenta estadoVenta, Long vendedorId, String vendedorNombre, String compradorNombre, String compradorTelefono) {
        this.estadoVenta = estadoVenta;
        this.vendedorId = vendedorId;
        this.vendedorNombre = vendedorNombre;
        this.compradorNombre = compradorNombre;
        this.compradorTelefono = compradorTelefono;
    }

    // Getters y Setters
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
}
