package com.rifas.BackRifas.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.rifas.BackRifas.dto.BoletoDTO;
import com.rifas.BackRifas.dto.CreateBoletoRequest;
import com.rifas.BackRifas.model.Boleto;
import com.rifas.BackRifas.model.EstadoVenta;
import com.rifas.BackRifas.model.Rifa;
import com.rifas.BackRifas.repository.BoletoRepository;
import com.rifas.BackRifas.repository.RifaRepository;

@Service
public class BoletoService {
    private final BoletoRepository boletoRepository;
    private final RifaRepository rifaRepository;

    public BoletoService(BoletoRepository boletoRepository, RifaRepository rifaRepository) {
        this.boletoRepository = boletoRepository;
        this.rifaRepository = rifaRepository;
    }

    /**
     * Generar todos los boletos de una rifa automáticamente
     */
    public void generarBoletos(Long rifaId, Long usuarioId) {
        Rifa rifa = rifaRepository.findByIdAndUsuarioId(rifaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Rifa no encontrada"));

        Integer cantidad = rifa.getCantidadBoletos();
        Integer cifras = cantidad.toString().length();

        // Generar números con formato de cifras
        String formato = "%0" + cifras + "d";

        for (int i = 0; i < cantidad; i++) {
            String numero = String.format(formato, i);
            Boleto boleto = new Boleto(rifa, numero);
            boletoRepository.save(boleto);
        }
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
    public BoletoDTO actualizarEstadoBoleto(Long boletoId, CreateBoletoRequest request, Long usuarioId) {
        Boleto boleto = boletoRepository.findById(boletoId)
                .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));

        // Verificar que el boleto pertenece a una rifa del usuario
        Rifa rifa = boleto.getRifa();
        if (!rifa.getUsuarioId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para modificar este boleto");
        }

        boleto.setEstadoVenta(request.getEstadoVenta());
        boleto.setCompradorEmail(request.getCompradorEmail());

        if (request.getEstadoVenta() == EstadoVenta.VENDIDO) {
            boleto.setFechaVenta(LocalDateTime.now());
        }

        Boleto actualizado = boletoRepository.save(boleto);
        return convertirADTO(actualizado);
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
                boleto.getCompradorEmail(),
                boleto.getFechaVenta(),
                boleto.getCreatedAt(),
                boleto.getUpdatedAt()
        );
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
