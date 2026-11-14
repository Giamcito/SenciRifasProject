package com.rifas.BackRifas.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rifas.BackRifas.dto.BoletoDTO;
import com.rifas.BackRifas.dto.BoletoPageDTO;
import com.rifas.BackRifas.dto.CrearAgrupacionRequest;
import com.rifas.BackRifas.dto.GrupoBoletoDTO;
import com.rifas.BackRifas.model.Boleto;
import com.rifas.BackRifas.model.EstadoVenta;
import com.rifas.BackRifas.model.GrupoBoleto;
import com.rifas.BackRifas.model.Rifa;
import com.rifas.BackRifas.repository.BoletoRepository;
import com.rifas.BackRifas.repository.GrupoBoletoRepository;
import com.rifas.BackRifas.repository.RifaRepository;
import com.rifas.BackRifas.repository.VendedorRepository;

@Service
public class GrupoBoletoService {
    private final GrupoBoletoRepository grupoBoletoRepository;
    private final BoletoRepository boletoRepository;
    private final RifaRepository rifaRepository;
    private final VendedorRepository vendedorRepository;

    public GrupoBoletoService(GrupoBoletoRepository grupoBoletoRepository, 
                             BoletoRepository boletoRepository, 
                             RifaRepository rifaRepository,
                             VendedorRepository vendedorRepository) {
        this.grupoBoletoRepository = grupoBoletoRepository;
        this.boletoRepository = boletoRepository;
        this.rifaRepository = rifaRepository;
        this.vendedorRepository = vendedorRepository;
    }

    /**
     * Crear una agrupación con vendedor asignado y boletos seleccionados
     */

    /**
     * Obtener boletos disponibles paginados para evitar cargar miles de registros de una sola vez
     */
    @Transactional(readOnly = true)
    public BoletoPageDTO obtenerBoletosDisponiblesPaginados(Long rifaId, String busqueda, Long usuarioId, int page, int size) {
    rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
        .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "numero"));

    Page<Boleto> boletosPage;
    if (busqueda != null && !busqueda.isBlank()) {
        boletosPage = boletoRepository.findBoletosDisponiblesConBusqueda(
            rifaId,
            EstadoVenta.DISPONIBLE,
            busqueda,
            pageable);
    } else {
        boletosPage = boletoRepository.findByRifaIdAndGrupoIdIsNullAndEstadoVentaOrderByNumeroAsc(
            rifaId,
            EstadoVenta.DISPONIBLE,
            pageable);
    }

    List<BoletoDTO> content = boletosPage.getContent().stream()
        .map(this::convertirBoletoADTO)
        .collect(Collectors.toList());

    return new BoletoPageDTO(
        content,
        boletosPage.getNumber(),
        boletosPage.getSize(),
        boletosPage.getTotalElements(),
        boletosPage.getTotalPages(),
        boletosPage.isFirst(),
        boletosPage.isLast());
    }
    @Transactional
    public GrupoBoletoDTO crearAgrupacion(Long rifaId, CrearAgrupacionRequest request, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        if (!rifa.getGruposHabilitado()) {
            throw new RuntimeException("Los grupos no están habilitados para esta rifa");
        }

        if (request.getVendedorId() == null) {
            throw new RuntimeException("Debes seleccionar un vendedor");
        }

        if (request.getBoletoIds() == null || request.getBoletoIds().isEmpty()) {
            throw new RuntimeException("Debes seleccionar al menos un boleto");
        }

        var vendedor = vendedorRepository.findByIdAndUsuarioId(request.getVendedorId(), usuarioId)
                .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));

        String nombreGrupo = "Agrupación " + (grupoBoletoRepository.countByRifaId(rifaId) + 1);
        GrupoBoleto grupo = new GrupoBoleto(rifa, nombreGrupo, rifa.getValorBoleto());
        grupo.setEstadoVenta(EstadoVenta.AGRUPADA);
        grupo.setVendedorId(vendedor.getId());
        grupo.setVendedorNombre(vendedor.getNombre());

        GrupoBoleto saved = grupoBoletoRepository.save(grupo);
        List<Boleto> boletos = boletoRepository.findAllById(request.getBoletoIds());
        for (Boleto boleto : boletos) {
            if (!boleto.getRifa().getId().equals(rifaId)) {
                throw new RuntimeException("El boleto " + boleto.getId() + " no pertenece a la rifa");
            }
            if (boleto.getGrupoId() != null) {
                throw new RuntimeException("El boleto " + boleto.getId() + " ya pertenece a otro grupo");
            }
            if (boleto.getEstadoVenta() != EstadoVenta.DISPONIBLE) {
                throw new RuntimeException("El boleto " + boleto.getId() + " no está disponible para agrupar");
            }
            boleto.setGrupoId(saved.getId());
            boleto.setEstadoVenta(EstadoVenta.AGRUPADA);
            boleto.setVendedorId(vendedor.getId());
            boleto.setVendedorNombre(vendedor.getNombre());
            boleto.setCompradorNombre(null);
            boleto.setCompradorTelefono(null);
            boleto.setFechaVenta(null);
            boleto.setMontoAbonado(BigDecimal.ZERO);
            saved.getBoletos().add(boleto);
        }

        boletoRepository.saveAll(boletos);
        GrupoBoleto actualizado = grupoBoletoRepository.save(saved);
        return convertirADTO(actualizado);
    }

    /**
     * Crear un nuevo grupo de boletos
     */
    @Transactional
    public GrupoBoletoDTO crearGrupo(Long rifaId, String nombre, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        if (!rifa.getGruposHabilitado()) {
            throw new RuntimeException("Los grupos no están habilitados para esta rifa");
        }

        String nombreGrupo = (nombre == null || nombre.isBlank())
                ? "Agrupación " + (grupoBoletoRepository.countByRifaId(rifaId) + 1)
                : nombre;

        GrupoBoleto grupo = new GrupoBoleto(rifa, nombreGrupo, rifa.getValorBoleto());
        GrupoBoleto saved = grupoBoletoRepository.save(grupo);

        return convertirADTO(saved);
    }

    /**
     * Obtener todos los grupos de una rifa
     */
    @Transactional(readOnly = true)
    public List<GrupoBoletoDTO> obtenerGrupos(Long rifaId, Long usuarioId) {
        rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        List<GrupoBoleto> grupos = grupoBoletoRepository.findByRifaIdWithBoletos(rifaId);
        return grupos.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    /**
     * Obtener boletos disponibles (no asignados a ningún grupo)
     */
    @Transactional(readOnly = true)
    public List<BoletoDTO> obtenerBoletosDisponibles(Long rifaId, String busqueda, Long usuarioId) {
        rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        List<Boleto> todosLosBoletos = boletoRepository.findByRifaIdOrderByNumeroAsc(rifaId);

        List<BoletoDTO> boletosDisponibles = todosLosBoletos.stream()
            .filter(b -> b.getGrupoId() == null)
            .filter(b -> b.getEstadoVenta() == EstadoVenta.DISPONIBLE)
                .map(this::convertirBoletoADTO)
                .collect(Collectors.toList());

        // Filtrar por búsqueda si se proporciona
        if (busqueda != null && !busqueda.isEmpty()) {
            String searchLower = busqueda.toLowerCase();
            boletosDisponibles = boletosDisponibles.stream()
                    .filter(b -> b.getNumero().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
        }

        return boletosDisponibles;
    }

    /**
     * Añadir boletos a un grupo
     */
    @Transactional
    public GrupoBoletoDTO agregarBoletosAGrupo(Long rifaId, Long grupoId, List<Long> boletoIds, Long usuarioId) {
        rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        GrupoBoleto grupo = grupoBoletoRepository.findById(grupoId)
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

        if (!grupo.getRifa().getId().equals(rifaId)) {
            throw new RuntimeException("El grupo no pertenece a la rifa especificada");
        }

        List<Boleto> boletos = boletoRepository.findAllById(boletoIds);
        
        for (Boleto boleto : boletos) {
            if (!boleto.getRifa().getId().equals(rifaId)) {
                throw new RuntimeException("El boleto " + boleto.getId() + " no pertenece a la rifa");
            }
            if (boleto.getEstadoVenta() != EstadoVenta.DISPONIBLE && boleto.getGrupoId() == null) {
                throw new RuntimeException("El boleto " + boleto.getId() + " no está disponible para agrupar");
            }
            if (boleto.getGrupoId() != null && !boleto.getGrupoId().equals(grupo.getId())) {
                throw new RuntimeException("El boleto " + boleto.getId() + " ya pertenece a otro grupo");
            }
            if (!grupo.getBoletos().contains(boleto)) {
                boleto.setGrupoId(grupo.getId());
                boleto.setEstadoVenta(EstadoVenta.AGRUPADA);
                boleto.setVendedorId(grupo.getVendedorId());
                boleto.setVendedorNombre(grupo.getVendedorNombre());
                boleto.setCompradorNombre(null);
                boleto.setCompradorTelefono(null);
                boleto.setFechaVenta(null);
                boleto.setMontoAbonado(BigDecimal.ZERO);
                grupo.getBoletos().add(boleto);
            }
        }

        boletoRepository.saveAll(boletos);
        GrupoBoleto saved = grupoBoletoRepository.save(grupo);
        return convertirADTO(saved);
    }

    /**
     * Remover boletos de un grupo
     */
    @Transactional
    public GrupoBoletoDTO removerBoletosDelGrupo(Long rifaId, Long grupoId, List<Long> boletoIds, Long usuarioId) {
        rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        GrupoBoleto grupo = grupoBoletoRepository.findById(grupoId)
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

        if (!grupo.getRifa().getId().equals(rifaId)) {
            throw new RuntimeException("El grupo no pertenece a la rifa especificada");
        }

        List<Boleto> boletos = boletoRepository.findAllById(boletoIds);
        for (Boleto boleto : boletos) {
            if (!grupo.getBoletos().contains(boleto)) {
                continue;
            }
            grupo.getBoletos().remove(boleto);

            boleto.setGrupoId(null);
            if (boleto.getEstadoVenta() == EstadoVenta.AGRUPADA) {
                boleto.setEstadoVenta(EstadoVenta.DISPONIBLE);
            }
            boleto.setVendedorId(null);
            boleto.setVendedorNombre(null);
            boleto.setCompradorNombre(null);
            boleto.setCompradorTelefono(null);
            boleto.setFechaVenta(null);
            boleto.setMontoAbonado(BigDecimal.ZERO);
        }

        boletoRepository.saveAll(boletos);

        GrupoBoleto saved = grupoBoletoRepository.save(grupo);
        return convertirADTO(saved);
    }

    /**
     * Eliminar un grupo
     */
    @Transactional
    public void eliminarGrupo(Long rifaId, Long grupoId, Long usuarioId) {
        rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        GrupoBoleto grupo = grupoBoletoRepository.findById(grupoId)
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

        if (!grupo.getRifa().getId().equals(rifaId)) {
            throw new RuntimeException("El grupo no pertenece a la rifa especificada");
        }

        List<Boleto> boletosDelGrupo = new ArrayList<>(grupo.getBoletos());

        for (Boleto boleto : boletosDelGrupo) {
            boleto.setGrupoId(null);
            boleto.setEstadoVenta(EstadoVenta.DISPONIBLE);
            boleto.setVendedorId(null);
            boleto.setVendedorNombre(null);
            boleto.setCompradorNombre(null);
            boleto.setCompradorTelefono(null);
            boleto.setFechaVenta(null);
            boleto.setMontoAbonado(BigDecimal.ZERO);
            boleto.setDescontarParteVendedor(false);
            boleto.setMontoNetoRecogido(BigDecimal.ZERO);
        }

        boletoRepository.saveAll(boletosDelGrupo);

        grupo.getBoletos().clear();
        grupoBoletoRepository.save(grupo);
        
        // Eliminar el grupo
        grupoBoletoRepository.delete(grupo);
    }

    /**
     * Obtener un grupo específico
     */
    @Transactional(readOnly = true)
    public GrupoBoletoDTO obtenerGrupo(Long rifaId, Long grupoId, Long usuarioId) {
        rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        GrupoBoleto grupo = grupoBoletoRepository.findById(grupoId)
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

        if (!grupo.getRifa().getId().equals(rifaId)) {
            throw new RuntimeException("El grupo no pertenece a la rifa especificada");
        }

        return convertirADTO(grupo);
    }

    /**
     * Contar boletos en un grupo
     */
    @Transactional(readOnly = true)
    public Integer contarBoletosEnGrupo(Long rifaId, Long grupoId, Long usuarioId) {
        rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        GrupoBoleto grupo = grupoBoletoRepository.findById(grupoId)
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

        if (!grupo.getRifa().getId().equals(rifaId)) {
            throw new RuntimeException("El grupo no pertenece a la rifa especificada");
        }

        return grupo.getBoletos().size();
    }

    // Métodos auxiliares
    private GrupoBoletoDTO convertirADTO(GrupoBoleto grupo) {
        List<BoletoDTO> boletosDTO = grupo.getBoletos().stream()
                .map(this::convertirBoletoADTO)
                .collect(Collectors.toList());

        GrupoBoletoDTO dto = new GrupoBoletoDTO(
                grupo.getId(),
                grupo.getRifa().getId(),
                grupo.getNombre(),
                boletosDTO,
                grupo.getValor(),
                grupo.getEstadoVenta(),
                grupo.getCompradorNombre(),
                grupo.getCompradorTelefono(),
                grupo.getVendedorId(),
                grupo.getVendedorNombre(),
                grupo.getFechaVenta(),
                grupo.getMontoAbonado()
        );
        dto.setCreatedAt(grupo.getCreatedAt());
        dto.setUpdatedAt(grupo.getUpdatedAt());
        return dto;
    }

    private BoletoDTO convertirBoletoADTO(Boleto boleto) {
        GrupoBoleto grupo = boleto.getGrupoId() == null
            ? null
            : grupoBoletoRepository.findById(boleto.getGrupoId()).orElse(null);

        BigDecimal montoNeto = boleto.getMontoNetoRecogido() == null ? BigDecimal.ZERO : boleto.getMontoNetoRecogido();

        return new BoletoDTO(
                boleto.getId(),
                boleto.getRifa().getId(),
                boleto.getNumero(),
                boleto.getEstadoVenta(),
                boleto.getGrupoId(),
            grupo != null ? grupo.getNombre() : null,
            grupo != null ? grupo.getEstadoVenta() : null,
            grupo != null ? grupo.getVendedorNombre() : null,
            grupo != null ? grupo.getMontoAbonado() : null,
            grupo != null && grupo.getValor() != null
                ? grupo.getValor().subtract(grupo.getMontoAbonado() == null ? BigDecimal.ZERO : grupo.getMontoAbonado())
                : null,
                boleto.getVendedorId(),
                boleto.getVendedorNombre(),
                boleto.getCompradorNombre(),
                boleto.getCompradorTelefono(),
                boleto.getFechaVenta(),
                boleto.getMontoAbonado(),
                boleto.getDescontarParteVendedor(),
                montoNeto,
                boleto.getCreatedAt(),
                boleto.getUpdatedAt()
        );
    }
}
