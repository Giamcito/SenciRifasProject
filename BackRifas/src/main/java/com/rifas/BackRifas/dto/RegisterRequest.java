package com.rifas.BackRifas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "Nombre es requerido")
    @Size(min = 3, message = "Nombre debe tener al menos 3 caracteres")
    private String nombre;

    @NotBlank(message = "Email es requerido")
    @Email(message = "Email debe ser válido")
    private String email;

    @NotBlank(message = "Contraseña es requerida")
    @Size(min = 6, message = "Contraseña debe tener al menos 6 caracteres")
    private String password;

    @NotBlank(message = "Confirmación de contraseña es requerida")
    private String password_confirm;

    public RegisterRequest() {}

    public RegisterRequest(String nombre, String email, String password, String password_confirm) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.password_confirm = password_confirm;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPassword_confirm() {
        return password_confirm;
    }

    public void setPassword_confirm(String password_confirm) {
        this.password_confirm = password_confirm;
    }
}
