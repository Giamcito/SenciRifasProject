package com.rifas.BackRifas.dto;

import java.util.List;

public class CrearAgrupacionRequest {
    private Long vendedorId;
    private List<Long> boletoIds;

    public CrearAgrupacionRequest() {}

    public Long getVendedorId() {
        return vendedorId;
    }

    public void setVendedorId(Long vendedorId) {
        this.vendedorId = vendedorId;
    }

    public List<Long> getBoletoIds() {
        return boletoIds;
    }

    public void setBoletoIds(List<Long> boletoIds) {
        this.boletoIds = boletoIds;
    }
}