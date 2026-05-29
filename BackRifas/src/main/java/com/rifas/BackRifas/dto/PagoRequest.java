package com.rifas.BackRifas.dto;

import java.math.BigDecimal;

public class PagoRequest {
    private BigDecimal monto;
    private Long vendedorId;
    private String vendedorNombre;
    private String compradorNombre;
    private String compradorTelefono;

    public PagoRequest() {}

    public PagoRequest(BigDecimal monto, Long vendedorId, String vendedorNombre, String compradorNombre, String compradorTelefono) {
        this.monto = monto;
        this.vendedorId = vendedorId;
        this.vendedorNombre = vendedorNombre;
        this.compradorNombre = compradorNombre;
        this.compradorTelefono = compradorTelefono;
    }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }
    public Long getVendedorId() { return vendedorId; }
    public void setVendedorId(Long vendedorId) { this.vendedorId = vendedorId; }
    public String getVendedorNombre() { return vendedorNombre; }
    public void setVendedorNombre(String vendedorNombre) { this.vendedorNombre = vendedorNombre; }
    public String getCompradorNombre() { return compradorNombre; }
    public void setCompradorNombre(String compradorNombre) { this.compradorNombre = compradorNombre; }
    public String getCompradorTelefono() { return compradorTelefono; }
    public void setCompradorTelefono(String compradorTelefono) { this.compradorTelefono = compradorTelefono; }
}
