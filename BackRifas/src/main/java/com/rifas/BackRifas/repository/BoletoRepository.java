package com.rifas.BackRifas.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rifas.BackRifas.model.Boleto;
import com.rifas.BackRifas.model.EstadoVenta;

@Repository
public interface BoletoRepository extends JpaRepository<Boleto, Long> {
    
    /**
     * Obtener todos los boletos de una rifa
     */
    List<Boleto> findByRifaId(Long rifaId);

    /**
     * Obtener boletos de una rifa paginados
     */
    Page<Boleto> findByRifaId(Long rifaId, Pageable pageable);

    /**
     * Obtener boletos de una rifa paginados por estado
     */
    Page<Boleto> findByRifaIdAndEstadoVenta(Long rifaId, EstadoVenta estadoVenta, Pageable pageable);

    /**
     * Obtener boletos de una rifa asignados a un vendedor
     */
    @Query("SELECT b FROM Boleto b WHERE b.rifa.id = :rifaId AND b.vendedorId = :vendedorId ORDER BY b.numero ASC")
    List<Boleto> findByRifaIdAndVendedorIdOrderByNumeroAsc(@Param("rifaId") Long rifaId, @Param("vendedorId") Long vendedorId);

    /**
     * Obtener boletos de una rifa asignados a un vendedor y filtrados por estado
     */
    @Query("SELECT b FROM Boleto b WHERE b.rifa.id = :rifaId AND b.vendedorId = :vendedorId AND b.estadoVenta = :estadoVenta ORDER BY b.numero ASC")
    List<Boleto> findByRifaIdAndVendedorIdAndEstadoVentaOrderByNumeroAsc(@Param("rifaId") Long rifaId, @Param("vendedorId") Long vendedorId, @Param("estadoVenta") EstadoVenta estadoVenta);

    /**
     * Contar boletos asignados a un vendedor dentro de una rifa
     */
    @Query("SELECT COUNT(b) FROM Boleto b WHERE b.rifa.id = :rifaId AND b.vendedorId = :vendedorId")
    long countByRifaIdAndVendedorId(@Param("rifaId") Long rifaId, @Param("vendedorId") Long vendedorId);

    /**
     * Contar boletos asignados a un vendedor dentro de una rifa por estado
     */
    @Query("SELECT COUNT(b) FROM Boleto b WHERE b.rifa.id = :rifaId AND b.vendedorId = :vendedorId AND b.estadoVenta = :estadoVenta")
    long countByRifaIdAndVendedorIdAndEstadoVenta(@Param("rifaId") Long rifaId, @Param("vendedorId") Long vendedorId, @Param("estadoVenta") EstadoVenta estadoVenta);

    /**
     * Sumar el dinero abonado en los boletos de un vendedor dentro de una rifa
     */
    @Query("SELECT COALESCE(SUM(b.montoAbonado), 0) FROM Boleto b WHERE b.rifa.id = :rifaId AND b.vendedorId = :vendedorId")
    java.math.BigDecimal sumMontoAbonadoByRifaIdAndVendedorId(@Param("rifaId") Long rifaId, @Param("vendedorId") Long vendedorId);

    /**
     * Obtener un boleto específico por rifa y número
     */
    Optional<Boleto> findByRifaIdAndNumero(Long rifaId, String numero);

    /**
     * Contar boletos por estado
     */
    long countByRifaIdAndEstadoVenta(Long rifaId, EstadoVenta estadoVenta);

    /**
     * Contar todos los boletos de una rifa
     */
    long countByRifaId(Long rifaId);

    /**
     * Obtener todos los boletos vendidos de una rifa
     */
    @Query("SELECT b FROM Boleto b WHERE b.rifa.id = :rifaId AND b.estadoVenta = 'VENDIDO' ORDER BY b.numero ASC")
    List<Boleto> findVendidosByRifaId(@Param("rifaId") Long rifaId);

    /**
     * Eliminar todos los boletos de una rifa
     */
    void deleteByRifaId(Long rifaId);
}
