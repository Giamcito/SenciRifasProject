package com.rifas.BackRifas.dto;

import java.math.BigDecimal;
import java.util.List;

public class ConsultaVendedorDTO {
    private Long vendedorId;
    private String vendedorNombre;
    private long totalBoletas;
    private long totalVendidas;
    private long totalAbonadas;
    private long totalDisponibles;
    private BigDecimal dineroRecogido;
    private List<BoletoDTO> boletos;

    public ConsultaVendedorDTO() {}

    public ConsultaVendedorDTO(Long vendedorId, String vendedorNombre, long totalBoletas, long totalVendidas,
                               long totalAbonadas, long totalDisponibles, BigDecimal dineroRecogido,
                               List<BoletoDTO> boletos) {
        this.vendedorId = vendedorId;
        this.vendedorNombre = vendedorNombre;
        this.totalBoletas = totalBoletas;
        this.totalVendidas = totalVendidas;
        this.totalAbonadas = totalAbonadas;
        this.totalDisponibles = totalDisponibles;
        this.dineroRecogido = dineroRecogido;
        this.boletos = boletos;
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

    public long getTotalBoletas() {
        return totalBoletas;
    }

    public void setTotalBoletas(long totalBoletas) {
        this.totalBoletas = totalBoletas;
    }

    public long getTotalVendidas() {
        return totalVendidas;
    }

    public void setTotalVendidas(long totalVendidas) {
        this.totalVendidas = totalVendidas;
    }

    public long getTotalAbonadas() {
        return totalAbonadas;
    }

    public void setTotalAbonadas(long totalAbonadas) {
        this.totalAbonadas = totalAbonadas;
    }

    public long getTotalDisponibles() {
        return totalDisponibles;
    }

    public void setTotalDisponibles(long totalDisponibles) {
        this.totalDisponibles = totalDisponibles;
    }

    public BigDecimal getDineroRecogido() {
        return dineroRecogido;
    }

    public void setDineroRecogido(BigDecimal dineroRecogido) {
        this.dineroRecogido = dineroRecogido;
    }

    public List<BoletoDTO> getBoletos() {
        return boletos;
    }

    public void setBoletos(List<BoletoDTO> boletos) {
        this.boletos = boletos;
    }
}