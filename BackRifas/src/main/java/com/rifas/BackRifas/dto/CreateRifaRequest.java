package com.rifas.BackRifas.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class CreateRifaRequest {
    @NotBlank(message = "El nombre de la rifa es requerido")
    private String nombre;

    @Positive(message = "La cantidad de boletos debe ser positiva")
    private Integer cantidadBoletos;

    @Positive(message = "El valor del boleto debe ser positivo")
    private BigDecimal valorBoleto;

    private Boolean gruposHabilitado = false;
    private Integer cantidadAgrupacion;

    public CreateRifaRequest() {}

    public CreateRifaRequest(String nombre, Integer cantidadBoletos, BigDecimal valorBoleto, 
                           Boolean gruposHabilitado, Integer cantidadAgrupacion) {
        this.nombre = nombre;
        this.cantidadBoletos = cantidadBoletos;
        this.valorBoleto = valorBoleto;
        this.gruposHabilitado = gruposHabilitado;
        this.cantidadAgrupacion = cantidadAgrupacion;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getCantidadBoletos() {
        return cantidadBoletos;
    }

    public void setCantidadBoletos(Integer cantidadBoletos) {
        this.cantidadBoletos = cantidadBoletos;
    }

    public BigDecimal getValorBoleto() {
        return valorBoleto;
    }

    public void setValorBoleto(BigDecimal valorBoleto) {
        this.valorBoleto = valorBoleto;
    }

    public Boolean getGruposHabilitado() {
        return gruposHabilitado;
    }

    public void setGruposHabilitado(Boolean gruposHabilitado) {
        this.gruposHabilitado = gruposHabilitado;
    }

    public Integer getCantidadAgrupacion() {
        return cantidadAgrupacion;
    }

    public void setCantidadAgrupacion(Integer cantidadAgrupacion) {
        this.cantidadAgrupacion = cantidadAgrupacion;
    }
}
