package com.rifas.BackRifas.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "rifas")
public class Rifa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Integer cantidadBoletos;

    @Column(nullable = false)
    private BigDecimal valorBoleto;

    @Column(nullable = false)
    private Long usuarioId; // ID del usuario propietario de la rifa

    @Column(name = "unique_id", unique = true, updatable = false)
    private String uniqueId;

    @Column(nullable = false)
    private Boolean gruposHabilitado = false;

    @Column(name = "cantidad_agrupacion")
    private Integer cantidadAgrupacion;

    @Column(nullable = false)
    private BigDecimal valorGrupo = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Rifa() {}

    public Rifa(String nombre, Integer cantidadBoletos, BigDecimal valorBoleto, Long usuarioId) {
        this.nombre = nombre;
        this.cantidadBoletos = cantidadBoletos;
        this.valorBoleto = valorBoleto;
        this.usuarioId = usuarioId;
    }

    @PrePersist
    protected void onCreate() {
        if (uniqueId == null || uniqueId.isBlank()) {
            uniqueId = generarCodigoPublico();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    private String generarCodigoPublico() {
        String aleatorio = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        return "RIFA-" + aleatorio;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters y Setters
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

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUniqueId() {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId) {
        this.uniqueId = uniqueId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
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

    public BigDecimal getValorGrupo() {
        return valorGrupo;
    }

    public void setValorGrupo(BigDecimal valorGrupo) {
        this.valorGrupo = valorGrupo;
    }
}
