package com.rifas.BackRifas.dto;

import com.rifas.BackRifas.model.EstadoVenta;

import jakarta.validation.constraints.NotNull;

public class CreateBoletoRequest {
    @NotNull(message = "El estado de venta es requerido")
    private EstadoVenta estadoVenta;

    private String compradorEmail;

    public CreateBoletoRequest() {}

    public CreateBoletoRequest(EstadoVenta estadoVenta, String compradorEmail) {
        this.estadoVenta = estadoVenta;
        this.compradorEmail = compradorEmail;
    }

    // Getters y Setters
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
}
