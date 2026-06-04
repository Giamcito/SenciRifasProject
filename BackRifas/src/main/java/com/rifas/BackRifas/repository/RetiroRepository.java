package com.rifas.BackRifas.repository;

import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.rifas.BackRifas.model.Retiro;

public interface RetiroRepository extends JpaRepository<Retiro, Long> {

    @Query("SELECT COALESCE(SUM(r.monto), 0) FROM Retiro r WHERE r.boleto.rifa.id = :rifaId AND r.vendedorId = :vendedorId")
    BigDecimal sumMontoByRifaIdAndVendedorId(@Param("rifaId") Long rifaId, @Param("vendedorId") Long vendedorId);

    boolean existsByGrupoId(Long grupoId);
    boolean existsByGrupoIdAndVendedorId(Long grupoId, Long vendedorId);

    @Modifying
    @Transactional
    @Query("delete from Retiro r where r.boleto.rifa.id = :rifaId")
    void deleteByBoletoRifaId(@Param("rifaId") Long rifaId);

}
