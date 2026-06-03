package com.rifas.BackRifas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rifas.BackRifas.model.EstadoVenta;
import com.rifas.BackRifas.model.GrupoBoleto;

@Repository
public interface GrupoBoletoRepository extends JpaRepository<GrupoBoleto, Long> {
    @Query("SELECT DISTINCT g FROM GrupoBoleto g LEFT JOIN FETCH g.boletos WHERE g.rifa.id = :rifaId ORDER BY g.id ASC")
    List<GrupoBoleto> findByRifaIdWithBoletos(@Param("rifaId") Long rifaId);

    List<GrupoBoleto> findByRifaIdOrderByNombreAsc(Long rifaId);
    
    List<GrupoBoleto> findByRifaIdAndEstadoVentaOrderByNombreAsc(Long rifaId, EstadoVenta estadoVenta);
    
    List<GrupoBoleto> findByRifaIdAndVendedorIdOrderByNombreAsc(Long rifaId, Long vendedorId);
    
    List<GrupoBoleto> findByRifaIdAndVendedorIdAndEstadoVentaOrderByNombreAsc(Long rifaId, Long vendedorId, EstadoVenta estadoVenta);
    
    Long countByRifaId(Long rifaId);
    
    Long countByRifaIdAndEstadoVenta(Long rifaId, EstadoVenta estadoVenta);
    
    Long countByRifaIdAndVendedorId(Long rifaId, Long vendedorId);
    
    Long countByRifaIdAndVendedorIdAndEstadoVenta(Long rifaId, Long vendedorId, EstadoVenta estadoVenta);
}
