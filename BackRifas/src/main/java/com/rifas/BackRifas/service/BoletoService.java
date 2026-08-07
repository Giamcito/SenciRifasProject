package com.rifas.BackRifas.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.rifas.BackRifas.dto.AsignarPropietarioRequest;
import com.rifas.BackRifas.dto.BoletoDTO;
import com.rifas.BackRifas.dto.BoletoPageDTO;
import com.rifas.BackRifas.dto.ConsultaVendedorDTO;
import com.rifas.BackRifas.dto.CreateBoletoRequest;
import com.rifas.BackRifas.model.Boleto;
import com.rifas.BackRifas.model.EstadoVenta;
import com.rifas.BackRifas.model.GrupoBoleto;
import com.rifas.BackRifas.model.Rifa;
import com.rifas.BackRifas.repository.BoletoRepository;
import com.rifas.BackRifas.repository.GrupoBoletoRepository;
import com.rifas.BackRifas.repository.RetiroRepository;
import com.rifas.BackRifas.repository.RifaRepository;
import com.rifas.BackRifas.repository.VendedorRepository;

@Service
public class BoletoService {
    private final BoletoRepository boletoRepository;
    private final GrupoBoletoRepository grupoBoletoRepository;
    private final RifaRepository rifaRepository;
    private final VendedorRepository vendedorRepository;
    private final RetiroRepository retiroRepository;

    public BoletoService(BoletoRepository boletoRepository, GrupoBoletoRepository grupoBoletoRepository, RifaRepository rifaRepository, VendedorRepository vendedorRepository, RetiroRepository retiroRepository) {
        this.boletoRepository = boletoRepository;
        this.grupoBoletoRepository = grupoBoletoRepository;
        this.rifaRepository = rifaRepository;
        this.vendedorRepository = vendedorRepository;
        this.retiroRepository = retiroRepository;
    }

    /**
     * Generar todos los boletos de una rifa automáticamente
     */
    public void generarBoletos(Long rifaId, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        if (boletoRepository.countByRifaId(rifaId) > 0) {
            throw new RuntimeException("Los boletos ya fueron generados para esta rifa");
        }

        Integer cantidad = rifa.getCantidadBoletos();
        Integer cifras = obtenerCifras(cantidad);

        // Generar números con formato de cifras
        String formato = "%0" + cifras + "d";

        for (int i = 0; i < cantidad; i++) {
            String numero = String.format(formato, i);
            Boleto boleto = new Boleto(rifa, numero);
            boletoRepository.save(boleto);
        }
    }

    private int obtenerCifras(int cantidadBoletos) {
        if (cantidadBoletos <= 1) {
            return 1;
        }
        return String.valueOf(cantidadBoletos - 1).length();
    }

    /**
     * Obtener todos los boletos de una rifa con validación de usuario
     */
    public List<BoletoDTO> obtenerBoletosPorRifa(Long rifaId, Long usuarioId) {
        rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        List<Boleto> boletos = boletoRepository.findByRifaId(rifaId);
        return boletos.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

        /**
         * Obtener boletos de una rifa paginados
         */
        public BoletoPageDTO obtenerBoletosPaginados(Long rifaId, Long usuarioId, int page, int size, EstadoVenta estadoVenta) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
            .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        int pagina = Math.max(page, 0);
        int tamano = Math.min(Math.max(size, 1), 500);
        Pageable pageable = PageRequest.of(pagina, tamano, Sort.by(Sort.Direction.ASC, "numero"));

        Page<Boleto> boletos = estadoVenta == null
            ? boletoRepository.findByRifaId(rifa.getId(), pageable)
            : boletoRepository.findByRifaIdAndEstadoVenta(rifa.getId(), estadoVenta, pageable);

        List<BoletoDTO> contenido = boletos.getContent().stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());

        return new BoletoPageDTO(
            contenido,
            boletos.getNumber(),
            boletos.getSize(),
            boletos.getTotalElements(),
            boletos.getTotalPages(),
            boletos.isFirst(),
            boletos.isLast()
        );
        }

        /**
         * Obtener un boleto específico por número con validación de usuario
         */
        public BoletoDTO obtenerBoletoPorNumero(Long rifaId, Long usuarioId, String numero) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
            .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        Boleto boleto = buscarBoletoPorNumero(rifa, numero);

        return convertirADTO(boleto);
        }

    /**
     * Obtener boletos sin validar usuario (uso temporal para depuración)
     */
    public List<BoletoDTO> obtenerBoletosPublico(Long rifaId) {
        List<Boleto> boletos = boletoRepository.findByRifaId(rifaId);
        return boletos.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    public BoletoDTO obtenerBoletoPorNumeroPublico(Long rifaId, String numero) {
        Rifa rifa = rifaRepository.findById(rifaId)
            .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));
        Boleto boleto = buscarBoletoPorNumero(rifa, numero);
        return convertirADTO(boleto);
    }

    /**
     * Obtener estadísticas de venta de una rifa
     */
    public EstadisticasDTO obtenerEstadisticas(Long rifaId, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        long totalBoletos = rifa.getCantidadBoletos();
        long vendidos = boletoRepository.countByRifaIdAndEstadoVenta(rifaId, EstadoVenta.VENDIDO);
        long abonados = boletoRepository.countByRifaIdAndEstadoVenta(rifaId, EstadoVenta.ABONADO)
            + boletoRepository.countByRifaIdAndEstadoVenta(rifaId, EstadoVenta.RESERVADO);
        long disponibles = totalBoletos - vendidos - abonados;

        return new EstadisticasDTO(totalBoletos, vendidos, disponibles, abonados);
    }

    /**
     * Actualizar estado de un boleto
     */
    public BoletoDTO actualizarEstadoBoleto(Long rifaId, Long boletoId, CreateBoletoRequest request, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        Boleto boleto = boletoRepository.findById(boletoId)
                .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));

        if (!boleto.getRifa().getId().equals(rifa.getId())) {
            throw new RuntimeException("Boleto no pertenece a la rifa indicada");
        }

        boleto.setEstadoVenta(request.getEstadoVenta());
        asignarVendedorSiCorresponde(boleto, request.getVendedorId(), request.getVendedorNombre(), usuarioId);
        boleto.setCompradorNombre(request.getCompradorNombre());
        boleto.setCompradorTelefono(request.getCompradorTelefono());
        if (request.getDescontarParteVendedor() != null) {
            boleto.setDescontarParteVendedor(request.getDescontarParteVendedor());
        }

        if (request.getEstadoVenta() == EstadoVenta.VENDIDO) {
            if (boleto.getMontoAbonado() == null || boleto.getMontoAbonado().compareTo(BigDecimal.ZERO) <= 0) {
                boleto.setMontoAbonado(rifa.getValorBoleto());
            }
            boleto.setFechaVenta(LocalDateTime.now());
        }

        boleto.setMontoNetoRecogido(calcularMontoNetoRecogido(boleto));

        Boleto actualizado = boletoRepository.save(boleto);
        sincronizarGrupoSiCorresponde(actualizado);
        actualizado = boletoRepository.findById(actualizado.getId())
                .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));
        return convertirADTO(actualizado);
    }

    /**
     * Aplicar un abono parcial a un boleto
     */
    public BoletoDTO aplicarAbono(Long rifaId, Long boletoId, com.rifas.BackRifas.dto.PagoRequest request, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        Boleto boleto = boletoRepository.findById(boletoId)
                .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));

        if (!boleto.getRifa().getId().equals(rifaId)) {
            throw new RuntimeException("Boleto no pertenece a la rifa");
        }

        if (boleto.getEstadoVenta() == EstadoVenta.VENDIDO) {
            throw new RuntimeException("Boleto ya está vendido");
        }

        if (request.getMonto() == null || request.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Monto inválido");
        }

        asignarVendedor(boleto, request.getVendedorId(), request.getVendedorNombre(), usuarioId);
        if (request.getCompradorNombre() != null) {
            boleto.setCompradorNombre(request.getCompradorNombre());
        }
        if (request.getCompradorTelefono() != null) {
            boleto.setCompradorTelefono(request.getCompradorTelefono());
        }

        BigDecimal valorBoleto = rifa.getValorBoleto();
        BigDecimal montoActual = boleto.getMontoAbonado() == null ? BigDecimal.ZERO : boleto.getMontoAbonado();
        BigDecimal nuevoAbono = montoActual.add(request.getMonto());

        if (nuevoAbono.compareTo(valorBoleto) > 0) {
            throw new RuntimeException("El monto a abonar no puede superar el valor del boleto");
        }

        boleto.setMontoAbonado(nuevoAbono);

        if (nuevoAbono.compareTo(valorBoleto) >= 0) {
            boleto.setEstadoVenta(EstadoVenta.VENDIDO);
            boleto.setFechaVenta(LocalDateTime.now());
        } else {
            boleto.setEstadoVenta(EstadoVenta.ABONADO);
        }

        boleto.setMontoNetoRecogido(calcularMontoNetoRecogido(boleto));

        Boleto actualizado = boletoRepository.save(boleto);
        sincronizarGrupoSiCorresponde(actualizado);
        actualizado = boletoRepository.findById(actualizado.getId())
            .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));
        return convertirADTO(actualizado);
    }

    /**
     * Pagar boleto (completar pago)
     */
    public BoletoDTO pagarCompleto(Long rifaId, Long boletoId, com.rifas.BackRifas.dto.PagoRequest request, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        Boleto boleto = boletoRepository.findById(boletoId)
                .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));

        if (!boleto.getRifa().getId().equals(rifaId)) {
            throw new RuntimeException("Boleto no pertenece a la rifa");
        }

        if (boleto.getEstadoVenta() == EstadoVenta.VENDIDO) {
            throw new RuntimeException("Boleto ya está vendido");
        }

        BigDecimal valorBoleto = rifa.getValorBoleto();
        boleto.setMontoAbonado(valorBoleto);
        boleto.setEstadoVenta(EstadoVenta.VENDIDO);
        boleto.setFechaVenta(LocalDateTime.now());
        asignarVendedor(boleto, request.getVendedorId(), request.getVendedorNombre(), usuarioId);
        if (request.getCompradorNombre() != null) boleto.setCompradorNombre(request.getCompradorNombre());
        if (request.getCompradorTelefono() != null) boleto.setCompradorTelefono(request.getCompradorTelefono());

        boleto.setMontoNetoRecogido(calcularMontoNetoRecogido(boleto));

        Boleto actualizado = boletoRepository.save(boleto);
        sincronizarGrupoSiCorresponde(actualizado);
        actualizado = boletoRepository.findById(actualizado.getId())
            .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));
        return convertirADTO(actualizado);
    }

    /**
     * Asignar propietario sin cambiar el estado de venta
     */
    public BoletoDTO asignarPropietario(Long rifaId, Long boletoId, AsignarPropietarioRequest request, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        Boleto boleto = boletoRepository.findById(boletoId)
                .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));

        if (!boleto.getRifa().getId().equals(rifa.getId())) {
            throw new RuntimeException("Boleto no pertenece a la rifa indicada");
        }

        asignarVendedor(boleto, request.getVendedorId(), request.getVendedorNombre(), usuarioId);

        boleto.setMontoNetoRecogido(calcularMontoNetoRecogido(boleto));

        Boleto actualizado = boletoRepository.save(boleto);
        sincronizarGrupoSiCorresponde(actualizado);
        actualizado = boletoRepository.findById(actualizado.getId())
            .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));
        return convertirADTO(actualizado);
    }

        /**
         * Obtener un resumen de ventas de un vendedor en una rifa, incluyendo sus boletos
         */
        public ConsultaVendedorDTO obtenerConsultaVendedor(Long rifaId, Long vendedorId, Long usuarioId, EstadoVenta estadoVenta) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
            .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        var vendedor = vendedorRepository.findByIdAndUsuarioId(vendedorId, usuarioId)
            .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));

        List<Boleto> boletosTotales = boletoRepository.findByRifaIdAndVendedorIdOrderByNumeroAsc(rifa.getId(), vendedor.getId());
        List<Boleto> boletos = estadoVenta == null
            ? boletosTotales
            : boletosTotales.stream()
                .filter(b -> b.getEstadoVenta() == estadoVenta)
                .collect(Collectors.toList());

        long totalBoletas = boletosTotales.size();
        long totalVendidas = boletoRepository.countByRifaIdAndVendedorIdAndEstadoVenta(rifa.getId(), vendedor.getId(), EstadoVenta.VENDIDO);
        long totalAbonadas = boletoRepository.countByRifaIdAndVendedorIdAndEstadoVenta(rifa.getId(), vendedor.getId(), EstadoVenta.ABONADO);
        long totalDisponibles = totalBoletas - totalVendidas - totalAbonadas;
        List<BoletoDTO> boletosDTO = boletos.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());

        BigDecimal dineroRecogidoGrupos = calcularDineroRecogidoGrupos(boletosTotales);
        BigDecimal dineroRecogido = calcularDineroRecogidoTotal(boletosTotales);
        BigDecimal dineroRetirado = retiroRepository.sumMontoByRifaIdAndVendedorId(rifa.getId(), vendedor.getId());

        return new ConsultaVendedorDTO(
            vendedor.getId(),
            vendedor.getNombre(),
            totalBoletas,
            totalVendidas,
            totalAbonadas,
            totalDisponibles,
            dineroRecogido,
            dineroRetirado,
            dineroRecogidoGrupos,
            boletosDTO
        );
        }

    public BoletoDTO registrarRetiro(Long rifaId, Long boletoId, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        Boleto boleto = boletoRepository.findById(boletoId)
                .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));

        if (!boleto.getRifa().getId().equals(rifa.getId())) {
            throw new RuntimeException("Boleto no pertenece a la rifa indicada");
        }


        BigDecimal parte = obtenerParteDelVendedor(boleto);

        Long grupoId = boleto.getGrupoId();

        // Si la boleta pertenece a un grupo, evitar crear múltiples retiros para la misma agrupación
        if (grupoId != null) {
            if (retiroRepository.existsByGrupoIdAndVendedorId(grupoId, boleto.getVendedorId())) {
                // Ya existe un retiro para esta agrupación y vendedor; actualizar flag y devolver
                boleto.setDescontarParteVendedor(true);
                boleto.setMontoNetoRecogido(calcularMontoNetoRecogido(boleto));
                boletoRepository.save(boleto);
                sincronizarGrupoSiCorresponde(boleto);
                Boleto actualizado2 = boletoRepository.findById(boleto.getId())
                        .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));
                return convertirADTO(actualizado2);
            }
        }

        com.rifas.BackRifas.model.Retiro retiro = new com.rifas.BackRifas.model.Retiro();
        retiro.setBoleto(boleto);
        Long vendedorId = boleto.getVendedorId();
        if (vendedorId == null && boleto.getGrupoId() != null) {
            GrupoBoleto grupo = grupoBoletoRepository.findById(boleto.getGrupoId()).orElse(null);
            if (grupo != null) vendedorId = grupo.getVendedorId();
        }
        retiro.setVendedorId(vendedorId);
        retiro.setMonto(parte);
        retiro.setFecha(LocalDateTime.now());
        retiro.setGrupoId(grupoId);

        retiroRepository.save(retiro);

        // Marcar toda la agrupación (si aplica)
        boleto.setDescontarParteVendedor(true);
        boleto.setMontoNetoRecogido(calcularMontoNetoRecogido(boleto));
        boletoRepository.save(boleto);
        sincronizarGrupoSiCorresponde(boleto);

        Boleto actualizado = boletoRepository.findById(boleto.getId())
                .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));

        return convertirADTO(actualizado);
    }

    /**
     * Convertir Boleto a DTO
     */
    private BoletoDTO convertirADTO(Boleto boleto) {
        GrupoBoleto grupo = boleto.getGrupoId() == null
            ? null
            : grupoBoletoRepository.findById(boleto.getGrupoId()).orElse(null);

        BigDecimal montoNeto = obtenerMontoNetoRecogido(boleto);

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
            grupo != null ? grupo.getValor().subtract(grupo.getMontoAbonado() == null ? BigDecimal.ZERO : grupo.getMontoAbonado()) : null,
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

    private Boleto buscarBoletoPorNumero(Rifa rifa, String numero) {
        String numeroBuscado = numero == null ? "" : numero.trim();

        return boletoRepository.findByRifaIdAndNumero(rifa.getId(), numeroBuscado)
                .orElseGet(() -> {
                    if (!numeroBuscado.matches("\\d+")) {
                        throw new RuntimeException("Boleto no encontrado");
                    }

                    int cifras = obtenerCifras(rifa.getCantidadBoletos());
                    String numeroNormalizado = String.format("%0" + cifras + "d", Integer.parseInt(numeroBuscado));

                    return boletoRepository.findByRifaIdAndNumero(rifa.getId(), numeroNormalizado)
                            .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));
                });
    }

    private BigDecimal calcularDineroRecogidoGrupos(List<Boleto> boletos) {
        BigDecimal total = BigDecimal.ZERO;
        Set<Long> gruposContabilizados = new HashSet<>();

        for (Boleto boleto : boletos) {
            if (boleto.getGrupoId() == null) {
                total = total.add(boleto.getMontoAbonado() == null ? BigDecimal.ZERO : boleto.getMontoAbonado());
                continue;
            }

            if (!gruposContabilizados.add(boleto.getGrupoId())) {
                continue;
            }

            List<Boleto> boletosGrupo = boletoRepository.findByGrupoIdOrderByNumeroAsc(boleto.getGrupoId());
            if (!boletosGrupo.isEmpty()) {
                total = total.add(obtenerMontoNetoRecogido(boletosGrupo.get(0)));
            } else {
                total = total.add(obtenerMontoNetoRecogido(boleto));
            }
        }

        return total;
    }

    private BigDecimal calcularDineroRecogidoTotal(List<Boleto> boletos) {
        BigDecimal total = BigDecimal.ZERO;
        Set<Long> gruposContabilizados = new HashSet<>();
        Set<Long> boletosContabilizados = new HashSet<>();

        for (Boleto boleto : boletos) {
            if (boleto.getGrupoId() == null) {
                if (!boletosContabilizados.add(boleto.getId())) {
                    continue;
                }
                total = total.add(obtenerMontoNetoRecogido(boleto));
                continue;
            }

            if (!gruposContabilizados.add(boleto.getGrupoId())) {
                continue;
            }

            List<Boleto> boletosGrupo = boletoRepository.findByGrupoIdOrderByNumeroAsc(boleto.getGrupoId());
            if (!boletosGrupo.isEmpty()) {
                total = total.add(obtenerMontoNetoRecogido(boletosGrupo.get(0)));
            } else {
                total = total.add(obtenerMontoNetoRecogido(boleto));
            }
        }

        return total;
    }

    private BigDecimal calcularMontoNetoRecogido(Boleto boleto) {
        BigDecimal montoAbonado = boleto.getMontoAbonado() == null ? BigDecimal.ZERO : boleto.getMontoAbonado();

        if (!Boolean.TRUE.equals(boleto.getDescontarParteVendedor())) {
            return montoAbonado;
        }

        if (boleto.getEstadoVenta() != EstadoVenta.VENDIDO) {
            return montoAbonado;
        }

        BigDecimal parteVendedor = obtenerParteDelVendedor(boleto);
        if (parteVendedor.compareTo(BigDecimal.ZERO) <= 0) {
            return montoAbonado;
        }

        BigDecimal neto = montoAbonado.subtract(parteVendedor);
        return neto.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : neto;
    }

    private BigDecimal obtenerMontoNetoRecogido(Boleto boleto) {
        return calcularMontoNetoRecogido(boleto);
    }

    private BigDecimal obtenerParteDelVendedor(Boleto boleto) {
        Long vendedorId = boleto.getVendedorId();

        if (vendedorId == null && boleto.getGrupoId() != null) {
            GrupoBoleto grupo = grupoBoletoRepository.findById(boleto.getGrupoId()).orElse(null);
            if (grupo != null) {
                vendedorId = grupo.getVendedorId();
            }
        }

        if (vendedorId == null) {
            return BigDecimal.ZERO;
        }

        return vendedorRepository.findById(vendedorId)
            .map(vendedor -> vendedor.getParteDelDinero() == null
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(vendedor.getParteDelDinero()))
            .orElse(BigDecimal.ZERO);
    }

    private void asignarVendedor(Boleto boleto, Long vendedorId, String vendedorNombre, Long usuarioId) {
        if (vendedorId != null) {
            var vendedor = vendedorRepository.findByIdAndUsuarioId(vendedorId, usuarioId)
                    .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));
            boleto.setVendedorId(vendedor.getId());
            boleto.setVendedorNombre(vendedor.getNombre());
            return;
        }

        if (vendedorNombre != null && !vendedorNombre.isBlank()) {
            boleto.setVendedorNombre(vendedorNombre.trim());
        }
    }

    private void asignarVendedorSiCorresponde(Boleto boleto, Long vendedorId, String vendedorNombre, Long usuarioId) {
        if (boleto.getEstadoVenta() == EstadoVenta.VENDIDO || boleto.getEstadoVenta() == EstadoVenta.ABONADO) {
            asignarVendedor(boleto, vendedorId, vendedorNombre, usuarioId);
        }
    }

    private void sincronizarGrupoSiCorresponde(Boleto boletoActualizado) {
        if (boletoActualizado.getGrupoId() == null) {
            return;
        }

        List<Boleto> boletosGrupo = boletoRepository.findByGrupoIdOrderByNumeroAsc(boletoActualizado.getGrupoId());
        if (boletosGrupo.isEmpty()) {
            return;
        }

        GrupoBoleto grupo = grupoBoletoRepository.findById(boletoActualizado.getGrupoId()).orElse(null);
        BigDecimal montoNetoRecalculado = calcularMontoNetoRecogido(boletoActualizado);

        for (Boleto boletoGrupo : boletosGrupo) {
            boletoGrupo.setEstadoVenta(boletoActualizado.getEstadoVenta());
            boletoGrupo.setVendedorId(boletoActualizado.getVendedorId());
            boletoGrupo.setVendedorNombre(boletoActualizado.getVendedorNombre());
            boletoGrupo.setCompradorNombre(boletoActualizado.getCompradorNombre());
            boletoGrupo.setCompradorTelefono(boletoActualizado.getCompradorTelefono());
            boletoGrupo.setFechaVenta(boletoActualizado.getFechaVenta());
            boletoGrupo.setMontoAbonado(boletoActualizado.getMontoAbonado());
            boletoGrupo.setDescontarParteVendedor(boletoActualizado.getDescontarParteVendedor());
            boletoGrupo.setMontoNetoRecogido(montoNetoRecalculado);
            boletoGrupo.setGrupoId(boletoActualizado.getGrupoId());
        }

        boletoRepository.saveAll(boletosGrupo);

        if (grupo != null) {
            grupo.setEstadoVenta(boletoActualizado.getEstadoVenta());
            grupo.setVendedorId(boletoActualizado.getVendedorId());
            grupo.setVendedorNombre(boletoActualizado.getVendedorNombre());
            grupo.setCompradorNombre(boletoActualizado.getCompradorNombre());
            grupo.setCompradorTelefono(boletoActualizado.getCompradorTelefono());
            grupo.setFechaVenta(boletoActualizado.getFechaVenta());
            grupo.setMontoAbonado(boletoActualizado.getMontoAbonado());
            grupoBoletoRepository.save(grupo);
        }
    }

    /**
     * DTO para estadísticas
     */
    public static class EstadisticasDTO {
        private long total;
        private long vendidos;
        private long disponibles;
        private long abonados;

        public EstadisticasDTO(long total, long vendidos, long disponibles, long abonados) {
            this.total = total;
            this.vendidos = vendidos;
            this.disponibles = disponibles;
            this.abonados = abonados;
        }

        public long getTotal() {
            return total;
        }

        public long getVendidos() {
            return vendidos;
        }

        public long getDisponibles() {
            return disponibles;
        }

        public long getAbonados() {
            return abonados;
        }
    }
}
