package com.rifas.BackRifas.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rifas.BackRifas.model.Rifa;

@Repository
public interface RifaRepository extends JpaRepository<Rifa, Long> {
    List<Rifa> findByUsuarioId(Long usuarioId);
    Optional<Rifa> findByIdAndUsuarioId(Long id, Long usuarioId);
}
