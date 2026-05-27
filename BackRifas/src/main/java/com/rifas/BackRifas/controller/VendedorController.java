package com.rifas.BackRifas.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.rifas.BackRifas.dto.CreateVendedorRequest;
import com.rifas.BackRifas.dto.VendedorDTO;
import com.rifas.BackRifas.model.Usuario;
import com.rifas.BackRifas.repository.UsuarioRepository;
import com.rifas.BackRifas.service.VendedorService;
import com.rifas.BackRifas.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendedores")
@CrossOrigin(origins = "http://localhost:4200")
public class VendedorController {
    @Autowired
    private VendedorService vendedorService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Crear un nuevo vendedor
     * POST /api/vendedores
     */
    @PostMapping
    public ResponseEntity<?> crearVendedor(
            @Valid @RequestBody CreateVendedorRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            VendedorDTO vendedor = vendedorService.crearVendedor(request, usuarioId);
            return ResponseEntity.status(HttpStatus.CREATED).body(vendedor);
        } catch (RuntimeException e) {
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        } catch (Exception e) {
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("error", "Error al crear vendedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }
    }

    /**
     * Obtener todos los vendedores del usuario
     * GET /api/vendedores
     */
    @GetMapping
    public ResponseEntity<?> obtenerVendedores(HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            List<VendedorDTO> vendedores = vendedorService.obtenerVendedoresDelUsuario(usuarioId);
            return ResponseEntity.ok(vendedores);
        } catch (RuntimeException e) {
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        } catch (Exception e) {
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("error", "Error al obtener vendedores: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }
    }

    /**
     * Obtener un vendedor por ID
     * GET /api/vendedores/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerVendedor(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            VendedorDTO vendedor = vendedorService.obtenerVendedor(id, usuarioId);
            return ResponseEntity.ok(vendedor);
        } catch (RuntimeException e) {
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(respuesta);
        } catch (Exception e) {
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("error", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }
    }

    /**
     * Actualizar un vendedor
     * PUT /api/vendedores/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarVendedor(
            @PathVariable Long id,
            @Valid @RequestBody CreateVendedorRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            VendedorDTO vendedor = vendedorService.actualizarVendedor(id, request, usuarioId);
            return ResponseEntity.ok(vendedor);
        } catch (RuntimeException e) {
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(respuesta);
        } catch (Exception e) {
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("error", "Error al actualizar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }
    }

    /**
     * Eliminar un vendedor
     * DELETE /api/vendedores/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarVendedor(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            vendedorService.eliminarVendedor(id, usuarioId);
            
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Vendedor eliminado correctamente");
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(respuesta);
        } catch (Exception e) {
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("error", "Error al eliminar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }
    }

    /**
     * Extrae el ID del usuario desde el token JWT en el header Authorization
     */
    private Long obtenerUsuarioIdDelToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token no proporcionado o formato incorrecto");
        }

        String token = authHeader.substring(7); // Eliminar "Bearer "

        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Token inválido o expirado");
        }

        String email = jwtUtil.getEmailFromToken(token);
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return usuario.getId();
    }
}

