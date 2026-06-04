package com.rifas.BackRifas.service;

import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rifas.BackRifas.dto.CreateRifaRequest;
import com.rifas.BackRifas.dto.RifaDTO;
import com.rifas.BackRifas.model.Boleto;
import com.rifas.BackRifas.model.GrupoBoleto;
import com.rifas.BackRifas.model.Rifa;
import com.rifas.BackRifas.repository.BoletoRepository;
import com.rifas.BackRifas.repository.GrupoBoletoRepository;
import com.rifas.BackRifas.repository.RifaRepository;

@Service
public class RifaService {
    private final RifaRepository rifaRepository;
    private final BoletoRepository boletoRepository;
    private final GrupoBoletoRepository grupoBoletoRepository;
    private final com.rifas.BackRifas.repository.RetiroRepository retiroRepository;

    public RifaService(RifaRepository rifaRepository, BoletoRepository boletoRepository, GrupoBoletoRepository grupoBoletoRepository, com.rifas.BackRifas.repository.RetiroRepository retiroRepository) {
        this.rifaRepository = rifaRepository;
        this.boletoRepository = boletoRepository;
        this.grupoBoletoRepository = grupoBoletoRepository;
        this.retiroRepository = retiroRepository;
    }

    /**
     * Crear una nueva rifa
     */
    public RifaDTO crearRifa(CreateRifaRequest request, Long usuarioId) {
        Rifa rifa = new Rifa(request.getNombre(), request.getCantidadBoletos(), request.getValorBoleto(), usuarioId);
        rifa.setGruposHabilitado(request.getGruposHabilitado() != null ? request.getGruposHabilitado() : false);
        if (Boolean.TRUE.equals(rifa.getGruposHabilitado())) {
            configurarAgrupacion(rifa, request.getCantidadAgrupacion());
        } else {
            rifa.setCantidadAgrupacion(null);
            rifa.setValorGrupo(java.math.BigDecimal.ZERO);
        }
        Rifa rifaGuardada = rifaRepository.save(rifa);
        return convertirADTO(rifaGuardada);
    }

    /**
     * Obtener todas las rifas del usuario
     */
    public List<RifaDTO> obtenerRifasDelUsuario(Long usuarioId) {
        List<Rifa> rifas = rifaRepository.findByUsuarioId(usuarioId);
        return rifas.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    /**
     * Obtener una rifa específica del usuario
     */
    public RifaDTO obtenerRifa(Long id, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada o no tienes permisos para verla"));
        return convertirADTO(rifa);
    }

    /**
     * Obtener una rifa específica del usuario por su código público
     */
    public RifaDTO obtenerRifaPorCodigoPublico(String uniqueId, Long usuarioId) {
        Rifa rifa = rifaRepository.findByUniqueIdAndUsuarioId(uniqueId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada o no tienes permisos para verla"));
        return convertirADTO(rifa);
    }

    /**
     * Actualizar una rifa
     */
    public RifaDTO actualizarRifa(Long id, CreateRifaRequest request, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada o no tienes permisos para editarla"));
        
        rifa.setNombre(request.getNombre());
        rifa.setCantidadBoletos(request.getCantidadBoletos());
        rifa.setValorBoleto(request.getValorBoleto());
        if (request.getGruposHabilitado() != null) {
            rifa.setGruposHabilitado(request.getGruposHabilitado());
        }
        if (Boolean.TRUE.equals(rifa.getGruposHabilitado())) {
            configurarAgrupacion(rifa, request.getCantidadAgrupacion());
        } else {
            rifa.setCantidadAgrupacion(null);
            rifa.setValorGrupo(java.math.BigDecimal.ZERO);
        }
        
        Rifa rifaActualizada = rifaRepository.save(rifa);
        return convertirADTO(rifaActualizada);
    }

    /**
     * Eliminar una rifa
     */
    @Transactional
    public void eliminarRifa(Long id, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada o no tienes permisos para eliminarla"));

        List<GrupoBoleto> grupos = grupoBoletoRepository.findByRifaIdWithBoletos(rifa.getId());
        for (GrupoBoleto grupo : grupos) {
            for (Boleto boleto : grupo.getBoletos()) {
                boleto.setGrupoId(null);
            }
            grupo.getBoletos().clear();
        }

        if (!grupos.isEmpty()) {
            grupoBoletoRepository.saveAll(grupos);
            grupoBoletoRepository.deleteAll(grupos);
        }

        // eliminar retiros asociados a boletos de la rifa antes de borrar boletos para evitar violación de FK
        retiroRepository.deleteByBoletoRifaId(rifa.getId());
        boletoRepository.deleteByRifaId(rifa.getId());
        rifaRepository.delete(rifa);
    }

    /**
     * Convertir entidad Rifa a DTO
     */
    private RifaDTO convertirADTO(Rifa rifa) {
        return new RifaDTO(rifa.getId(), rifa.getUniqueId(), rifa.getNombre(), rifa.getCantidadBoletos(), rifa.getValorBoleto(), 
                          rifa.getUsuarioId(), rifa.getGruposHabilitado(), rifa.getCantidadAgrupacion(), rifa.getValorGrupo(),
                          rifa.getCreatedAt(), rifa.getUpdatedAt());
    }

    private void configurarAgrupacion(Rifa rifa, Integer cantidadAgrupacion) {
        if (cantidadAgrupacion == null || cantidadAgrupacion < 1) {
            throw new RuntimeException("La cantidad de agrupación debe ser mayor o igual a 1");
        }

        rifa.setCantidadAgrupacion(cantidadAgrupacion);

        java.math.BigDecimal totalPotencial = rifa.getValorBoleto().multiply(java.math.BigDecimal.valueOf(rifa.getCantidadBoletos()));
        rifa.setValorGrupo(totalPotencial.divide(java.math.BigDecimal.valueOf(cantidadAgrupacion), 2, RoundingMode.HALF_UP));
    }
}
