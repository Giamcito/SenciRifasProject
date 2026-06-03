package com.rifas.BackRifas.service;

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

    public RifaService(RifaRepository rifaRepository, BoletoRepository boletoRepository, GrupoBoletoRepository grupoBoletoRepository) {
        this.rifaRepository = rifaRepository;
        this.boletoRepository = boletoRepository;
        this.grupoBoletoRepository = grupoBoletoRepository;
    }

    /**
     * Crear una nueva rifa
     */
    public RifaDTO crearRifa(CreateRifaRequest request, Long usuarioId) {
        Rifa rifa = new Rifa(request.getNombre(), request.getCantidadBoletos(), request.getValorBoleto(), usuarioId);
        rifa.setGruposHabilitado(request.getGruposHabilitado() != null ? request.getGruposHabilitado() : false);
        if (Boolean.TRUE.equals(rifa.getGruposHabilitado())) {
            rifa.setValorGrupo(request.getValorBoleto());
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
            rifa.setValorGrupo(request.getValorBoleto());
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

        boletoRepository.deleteByRifaId(rifa.getId());
        rifaRepository.delete(rifa);
    }

    /**
     * Convertir entidad Rifa a DTO
     */
    private RifaDTO convertirADTO(Rifa rifa) {
        return new RifaDTO(rifa.getId(), rifa.getNombre(), rifa.getCantidadBoletos(), rifa.getValorBoleto(), 
                          rifa.getUsuarioId(), rifa.getGruposHabilitado(), rifa.getValorGrupo(),
                          rifa.getCreatedAt(), rifa.getUpdatedAt());
    }
}
