package com.rifas.BackRifas.dto;

public class VendedorDTO {
    private Long id;
    private String nombre;
    private String numeroCelular;
    private String direccion;
    private Double parteDelDinero;

    public VendedorDTO() {}

    public VendedorDTO(Long id, String nombre, String numeroCelular, String direccion, Double parteDelDinero) {
        this.id = id;
        this.nombre = nombre;
        this.numeroCelular = numeroCelular;
        this.direccion = direccion;
        this.parteDelDinero = parteDelDinero;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
