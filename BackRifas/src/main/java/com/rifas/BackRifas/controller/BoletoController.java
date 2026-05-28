package com.rifas.BackRifas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rifas.BackRifas.dto.BoletoDTO;
import com.rifas.BackRifas.dto.CreateBoletoRequest;
import com.rifas.BackRifas.repository.UsuarioRepository;
import com.rifas.BackRifas.service.BoletoService;
import com.rifas.BackRifas.service.BoletoService.EstadisticasDTO;
import com.rifas.BackRifas.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rifas")
@CrossOrigin(origins = "http://localhost:4200")
public class BoletoController {
    private final BoletoService boletoService;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    public BoletoController(BoletoService boletoService, JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
        this.boletoService = boletoService;
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Obtener todos los boletos de una rifa
     */
    @GetMapping("/{rifaId}/boletos")
    public ResponseEntity<List<BoletoDTO>> obtenerBoletos(@PathVariable Long rifaId, HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            List<BoletoDTO> boletos = boletoService.obtenerBoletosPorRifa(rifaId, usuarioId);
            return ResponseEntity.ok(boletos);
        } catch (RuntimeException e) {
            String msg = e.getMessage() == null ? "" : e.getMessage().toLowerCase();
            if (msg.contains("token") || msg.contains("inválid") || msg.contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Obtener estadísticas de una rifa
     */
    @GetMapping("/{rifaId}/estadisticas")
    public ResponseEntity<EstadisticasDTO> obtenerEstadisticas(@PathVariable Long rifaId, HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            EstadisticasDTO estadisticas = boletoService.obtenerEstadisticas(rifaId, usuarioId);
            return ResponseEntity.ok(estadisticas);
        } catch (RuntimeException e) {
            String msg = e.getMessage() == null ? "" : e.getMessage().toLowerCase();
            if (msg.contains("token") || msg.contains("inválid") || msg.contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Generar boletos para una rifa
     */
    @PostMapping("/{rifaId}/generar-boletos")
    public ResponseEntity<Void> generarBoletos(@PathVariable Long rifaId, HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            boletoService.generarBoletos(rifaId, usuarioId);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (RuntimeException e) {
            String msg = e.getMessage() == null ? "" : e.getMessage().toLowerCase();
            if (msg.contains("token") || msg.contains("inválid") || msg.contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Actualizar estado de un boleto
     */
    @PutMapping("/boletos/{boletoId}")
    public ResponseEntity<BoletoDTO> actualizarBoleto(@PathVariable Long boletoId, 
                                                      @Valid @RequestBody CreateBoletoRequest request,
                                                      HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            BoletoDTO boletoDTO = boletoService.actualizarEstadoBoleto(boletoId, request, usuarioId);
            return ResponseEntity.ok(boletoDTO);
        } catch (RuntimeException e) {
            String msg = e.getMessage() == null ? "" : e.getMessage().toLowerCase();
            if (msg.contains("token") || msg.contains("inválid") || msg.contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Extraer usuarioId del token JWT
     */
    private Long obtenerUsuarioIdDelToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token no encontrado");
        }

        String token = authHeader.substring(7); // Remover "Bearer "
        
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Token inválido");
        }
        
        String email = jwtUtil.getEmailFromToken(token);

        return usuarioRepository.findByEmail(email)
                .map(usuario -> usuario.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}
