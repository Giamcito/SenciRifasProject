package com.rifas.BackRifas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CreateVendedorRequest {
    @NotBlank(message = "El nombre es requerido")
    private String nombre;

    private String numeroCelular; // Opcional

    private String direccion; // Opcional

    @NotNull(message = "La parte del dinero es requerida")
    @Positive(message = "La parte del dinero debe ser mayor a 0")
    private Double parteDelDinero;

    public CreateVendedorRequest() {}

    public CreateVendedorRequest(String nombre, String numeroCelular, String direccion, Double parteDelDinero) {
        this.nombre = nombre;
        this.numeroCelular = numeroCelular;
        this.direccion = direccion;
        this.parteDelDinero = parteDelDinero;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getNumeroCelular() {
        return numeroCelular;
    }

    public void setNumeroCelular(String numeroCelular) {
        this.numeroCelular = numeroCelular;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Double getParteDelDinero() {
        return parteDelDinero;
    }

    public void setParteDelDinero(Double parteDelDinero) {
        this.parteDelDinero = parteDelDinero;
    }
}
