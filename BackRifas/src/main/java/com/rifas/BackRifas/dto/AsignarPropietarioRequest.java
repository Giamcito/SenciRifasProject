package com.rifas.BackRifas.dto;

public class AsignarPropietarioRequest {
    private Long vendedorId;
    private String vendedorNombre;

    public AsignarPropietarioRequest() {}

    public AsignarPropietarioRequest(Long vendedorId, String vendedorNombre) {
        this.vendedorId = vendedorId;
        this.vendedorNombre = vendedorNombre;
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
}