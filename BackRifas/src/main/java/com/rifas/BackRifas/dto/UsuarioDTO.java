package com.rifas.BackRifas.dto;

public class UsuarioDTO {
    private Long id;
    private String uniqueId;
    private String nombre;
    private String email;

    public UsuarioDTO() {}

    public UsuarioDTO(Long id, String uniqueId, String nombre, String email) {
        this.id = id;
        this.uniqueId = uniqueId;
        this.nombre = nombre;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUniqueId() {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId) {
        this.uniqueId = uniqueId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
