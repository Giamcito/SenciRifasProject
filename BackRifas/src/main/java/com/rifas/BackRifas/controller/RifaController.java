package com.rifas.BackRifas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rifas.BackRifas.dto.CreateRifaRequest;
import com.rifas.BackRifas.dto.RifaDTO;
import com.rifas.BackRifas.repository.UsuarioRepository;
import com.rifas.BackRifas.service.RifaService;
import com.rifas.BackRifas.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rifas")
@CrossOrigin(origins = "http://localhost:4200")
public class RifaController {
    private final RifaService rifaService;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    public RifaController(RifaService rifaService, JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
        this.rifaService = rifaService;
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Crear una nueva rifa
     */
    @PostMapping
    public ResponseEntity<RifaDTO> crearRifa(@Valid @RequestBody CreateRifaRequest request, HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            RifaDTO rifaDTO = rifaService.crearRifa(request, usuarioId);
            return ResponseEntity.status(HttpStatus.CREATED).body(rifaDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Obtener todas las rifas del usuario autenticado
     */
    @GetMapping
    public ResponseEntity<List<RifaDTO>> obtenerRifas(HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            List<RifaDTO> rifas = rifaService.obtenerRifasDelUsuario(usuarioId);
            return ResponseEntity.ok(rifas);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Obtener una rifa específica
     */
    @GetMapping("/{id}")
    public ResponseEntity<RifaDTO> obtenerRifa(@PathVariable Long id, HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            RifaDTO rifaDTO = rifaService.obtenerRifa(id, usuarioId);
            return ResponseEntity.ok(rifaDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Actualizar una rifa
     */
    @PutMapping("/{id}")
    public ResponseEntity<RifaDTO> actualizarRifa(@PathVariable Long id, @Valid @RequestBody CreateRifaRequest request, HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            RifaDTO rifaDTO = rifaService.actualizarRifa(id, request, usuarioId);
            return ResponseEntity.ok(rifaDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Eliminar una rifa
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRifa(@PathVariable Long id, HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            rifaService.eliminarRifa(id, usuarioId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
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
