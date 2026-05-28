package com.rifas.BackRifas.repository;

import java.util.List;
import java.util.Optional;

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
     * Obtener un boleto específico por rifa y número
     */
    Optional<Boleto> findByRifaIdAndNumero(Long rifaId, String numero);

    /**
     * Contar boletos por estado
     */
    long countByRifaIdAndEstadoVenta(Long rifaId, EstadoVenta estadoVenta);

    /**
     * Obtener todos los boletos vendidos de una rifa
     */
    @Query("SELECT b FROM Boleto b WHERE b.rifa.id = :rifaId AND b.estadoVenta = 'VENDIDO' ORDER BY b.numero ASC")
    List<Boleto> findVendidosByRifaId(@Param("rifaId") Long rifaId);
}
