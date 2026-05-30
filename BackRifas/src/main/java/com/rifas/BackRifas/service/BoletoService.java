package com.rifas.BackRifas.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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
import com.rifas.BackRifas.model.Rifa;
import com.rifas.BackRifas.repository.BoletoRepository;
import com.rifas.BackRifas.repository.RifaRepository;
import com.rifas.BackRifas.repository.VendedorRepository;

@Service
public class BoletoService {
    private final BoletoRepository boletoRepository;
    private final RifaRepository rifaRepository;
    private final VendedorRepository vendedorRepository;

    public BoletoService(BoletoRepository boletoRepository, RifaRepository rifaRepository, VendedorRepository vendedorRepository) {
        this.boletoRepository = boletoRepository;
        this.rifaRepository = rifaRepository;
        this.vendedorRepository = vendedorRepository;
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
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
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

        Boleto boleto = boletoRepository.findByRifaIdAndNumero(rifa.getId(), numero)
            .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));

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
        Boleto boleto = boletoRepository.findByRifaIdAndNumero(rifaId, numero)
                .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));
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

        if (request.getEstadoVenta() == EstadoVenta.VENDIDO) {
            if (boleto.getMontoAbonado() == null || boleto.getMontoAbonado().compareTo(BigDecimal.ZERO) <= 0) {
                boleto.setMontoAbonado(rifa.getValorBoleto());
            }
            boleto.setFechaVenta(LocalDateTime.now());
        }

        Boleto actualizado = boletoRepository.save(boleto);
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

        Boleto actualizado = boletoRepository.save(boleto);
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

        Boleto actualizado = boletoRepository.save(boleto);
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

        Boleto actualizado = boletoRepository.save(boleto);
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

        List<Boleto> boletos = estadoVenta == null
            ? boletoRepository.findByRifaIdAndVendedorIdOrderByNumeroAsc(rifa.getId(), vendedor.getId())
            : boletoRepository.findByRifaIdAndVendedorIdAndEstadoVentaOrderByNumeroAsc(rifa.getId(), vendedor.getId(), estadoVenta);

        long totalBoletas = boletoRepository.countByRifaIdAndVendedorId(rifa.getId(), vendedor.getId());
        long totalVendidas = boletoRepository.countByRifaIdAndVendedorIdAndEstadoVenta(rifa.getId(), vendedor.getId(), EstadoVenta.VENDIDO);
        long totalAbonadas = boletoRepository.countByRifaIdAndVendedorIdAndEstadoVenta(rifa.getId(), vendedor.getId(), EstadoVenta.ABONADO);
        long totalDisponibles = totalBoletas - totalVendidas - totalAbonadas;
        BigDecimal dineroRecogido = boletoRepository.sumMontoAbonadoByRifaIdAndVendedorId(rifa.getId(), vendedor.getId());

        List<BoletoDTO> boletosDTO = boletos.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());

        return new ConsultaVendedorDTO(
            vendedor.getId(),
            vendedor.getNombre(),
            totalBoletas,
            totalVendidas,
            totalAbonadas,
            totalDisponibles,
            dineroRecogido,
            boletosDTO
        );
        }

    /**
     * Convertir Boleto a DTO
     */
    private BoletoDTO convertirADTO(Boleto boleto) {
        return new BoletoDTO(
                boleto.getId(),
                boleto.getRifa().getId(),
                boleto.getNumero(),
                boleto.getEstadoVenta(),
                boleto.getVendedorId(),
                boleto.getVendedorNombre(),
                boleto.getCompradorNombre(),
                boleto.getCompradorTelefono(),
                boleto.getFechaVenta(),
                boleto.getMontoAbonado(),
                boleto.getCreatedAt(),
                boleto.getUpdatedAt()
        );
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
