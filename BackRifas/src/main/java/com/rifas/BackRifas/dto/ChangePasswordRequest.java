package com.rifas.BackRifas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {
    @NotBlank(message = "Código público es requerido")
    private String uniqueId;

    @NotBlank(message = "Contraseña actual es requerida")
    private String currentPassword;

    @NotBlank(message = "Nueva contraseña es requerida")
    @Size(min = 6, message = "Nueva contraseña debe tener al menos 6 caracteres")
    private String newPassword;

    @NotBlank(message = "Confirmación de nueva contraseña es requerida")
    private String confirmNewPassword;

    public ChangePasswordRequest() {}

    public String getUniqueId() {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId) {
        this.uniqueId = uniqueId;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getConfirmNewPassword() {
        return confirmNewPassword;
    }

    public void setConfirmNewPassword(String confirmNewPassword) {
        this.confirmNewPassword = confirmNewPassword;
    }
}