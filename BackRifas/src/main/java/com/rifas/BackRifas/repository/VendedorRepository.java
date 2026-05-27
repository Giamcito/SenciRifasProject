package com.rifas.BackRifas.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rifas.BackRifas.model.Vendedor;

@Repository
public interface VendedorRepository extends JpaRepository<Vendedor, Long> {
    List<Vendedor> findByUsuarioId(Long usuarioId);
    Optional<Vendedor> findByIdAndUsuarioId(Long id, Long usuarioId);
}
