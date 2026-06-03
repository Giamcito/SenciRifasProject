package com.rifas.BackRifas.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "grupo_boletos")
public class GrupoBoleto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rifa_id", nullable = false)
    private Rifa rifa;

    @Column(nullable = false, length = 255)
    private String nombre;

    @ManyToMany
    @JoinTable(
        name = "grupo_boleto_boleto",
        joinColumns = @JoinColumn(name = "grupo_id"),
        inverseJoinColumns = @JoinColumn(name = "boleto_id")
    )
    private List<Boleto> boletos = new ArrayList<>();

    @Column(nullable = false)
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_venta", nullable = false, length = 20)
    private EstadoVenta estadoVenta = EstadoVenta.DISPONIBLE;

    @Column(name = "comprador_nombre", length = 255)
    private String compradorNombre;

    @Column(name = "comprador_telefono", length = 30)
    private String compradorTelefono;

    @Column(name = "vendedor_id")
    private Long vendedorId;

    @Column(name = "vendedor_nombre", length = 255)
    private String vendedorNombre;

    @Column(name = "fecha_venta")
    private LocalDateTime fechaVenta;

    @Column(name = "monto_abonado", nullable = false)
    private BigDecimal montoAbonado = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public GrupoBoleto() {}

    public GrupoBoleto(Rifa rifa, String nombre, BigDecimal valor) {
        this.rifa = rifa;
        this.nombre = nombre;
        this.valor = valor;
        this.estadoVenta = EstadoVenta.DISPONIBLE;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Rifa getRifa() {
        return rifa;
    }

    public void setRifa(Rifa rifa) {
        this.rifa = rifa;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public List<Boleto> getBoletos() {
        return boletos;
    }

    public void setBoletos(List<Boleto> boletos) {
        this.boletos = boletos;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public EstadoVenta getEstadoVenta() {
        return estadoVenta;
    }

    public void setEstadoVenta(EstadoVenta estadoVenta) {
        this.estadoVenta = estadoVenta;
    }

    public String getCompradorNombre() {
        return compradorNombre;
    }

    public void setCompradorNombre(String compradorNombre) {
        this.compradorNombre = compradorNombre;
    }

    public String getCompradorTelefono() {
        return compradorTelefono;
    }

    public void setCompradorTelefono(String compradorTelefono) {
        this.compradorTelefono = compradorTelefono;
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

    public LocalDateTime getFechaVenta() {
        return fechaVenta;
    }

    public void setFechaVenta(LocalDateTime fechaVenta) {
        this.fechaVenta = fechaVenta;
    }

    public BigDecimal getMontoAbonado() {
        return montoAbonado;
    }

    public void setMontoAbonado(BigDecimal montoAbonado) {
        this.montoAbonado = montoAbonado;
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
}
