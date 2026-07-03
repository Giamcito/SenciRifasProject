package com.rifas.BackRifas.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rifas.BackRifas.dto.BoletoPageDTO;
import com.rifas.BackRifas.dto.CrearAgrupacionRequest;
import com.rifas.BackRifas.dto.GrupoBoletoDTO;
import com.rifas.BackRifas.repository.UsuarioRepository;
import com.rifas.BackRifas.service.GrupoBoletoService;
import com.rifas.BackRifas.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/rifas/{rifaId}/grupos")
public class GrupoBoletoController {
    private final GrupoBoletoService grupoBoletoService;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    public GrupoBoletoController(GrupoBoletoService grupoBoletoService, JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
        this.grupoBoletoService = grupoBoletoService;
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
    }

    private Long obtenerUsuarioIdDelToken(String token) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Token no encontrado");
        }
        
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Token inválido");
        }
        
        String email = jwtUtil.getEmailFromToken(token);

        return usuarioRepository.findByEmail(email)
                .map(usuario -> usuario.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    /**
     * Crear una agrupación con vendedor y boletos seleccionados
     */
    @PostMapping("/agrupar")
    public ResponseEntity<?> crearAgrupacion(
            @PathVariable Long rifaId,
            @RequestBody CrearAgrupacionRequest request,
            @RequestParam(required = false) String token,
            HttpServletRequest requestHttp) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(token);
            GrupoBoletoDTO grupo = grupoBoletoService.crearAgrupacion(rifaId, request, usuarioId);
            return ResponseEntity.status(HttpStatus.CREATED).body(grupo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener todos los grupos de una rifa
     */
    @GetMapping
    public ResponseEntity<List<GrupoBoletoDTO>> obtenerGrupos(
            @PathVariable Long rifaId,
            @RequestParam(required = false) String token,
            HttpServletRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        List<GrupoBoletoDTO> grupos = grupoBoletoService.obtenerGrupos(rifaId, usuarioId);
        return ResponseEntity.ok(grupos);
    }

    /**
     * Crear un nuevo grupo
     */
    @PostMapping
    public ResponseEntity<GrupoBoletoDTO> crearGrupo(
            @PathVariable Long rifaId,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false) String token,
            HttpServletRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        String nombre = body.get("nombre");
        
        GrupoBoletoDTO grupo = grupoBoletoService.crearGrupo(rifaId, nombre, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(grupo);
    }

    /**
     * Obtener un grupo específico
     */
    @GetMapping("/{grupoId}")
    public ResponseEntity<GrupoBoletoDTO> obtenerGrupo(
            @PathVariable Long rifaId,
            @PathVariable Long grupoId,
            @RequestParam(required = false) String token,
            HttpServletRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        GrupoBoletoDTO grupo = grupoBoletoService.obtenerGrupo(rifaId, grupoId, usuarioId);
        return ResponseEntity.ok(grupo);
    }

    /**
     * Obtener boletos disponibles (no asignados a ningún grupo)
     */
    @GetMapping("/boletos-disponibles")
    public ResponseEntity<BoletoPageDTO> obtenerBoletosDisponibles(
            @PathVariable Long rifaId,
            @RequestParam(required = false) String busqueda,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(required = false) String token,
            HttpServletRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        BoletoPageDTO boletos = grupoBoletoService.obtenerBoletosDisponiblesPaginados(rifaId, busqueda, usuarioId, page, size);
        return ResponseEntity.ok(boletos);
    }

    /**
     * Agregar boletos a un grupo
     */
    @PostMapping("/{grupoId}/boletos")
    public ResponseEntity<GrupoBoletoDTO> agregarBoletosAGrupo(
            @PathVariable Long rifaId,
            @PathVariable Long grupoId,
            @RequestBody Map<String, List<Long>> body,
            @RequestParam(required = false) String token,
            HttpServletRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        List<Long> boletoIds = body.get("boletoIds");
        
        if (boletoIds == null || boletoIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        GrupoBoletoDTO grupo = grupoBoletoService.agregarBoletosAGrupo(rifaId, grupoId, boletoIds, usuarioId);
        return ResponseEntity.ok(grupo);
    }

    /**
     * Remover boletos de un grupo
     */
    @PostMapping("/{grupoId}/boletos/remover")
    public ResponseEntity<GrupoBoletoDTO> removerBoletosDelGrupo(
            @PathVariable Long rifaId,
            @PathVariable Long grupoId,
            @RequestBody Map<String, List<Long>> body,
            @RequestParam(required = false) String token,
            HttpServletRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        List<Long> boletoIds = body.get("boletoIds");
        
        if (boletoIds == null || boletoIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        GrupoBoletoDTO grupo = grupoBoletoService.removerBoletosDelGrupo(rifaId, grupoId, boletoIds, usuarioId);
        return ResponseEntity.ok(grupo);
    }

    /**
     * Eliminar un grupo
     */
    @DeleteMapping("/{grupoId}")
    public ResponseEntity<Void> eliminarGrupo(
            @PathVariable Long rifaId,
            @PathVariable Long grupoId,
            @RequestParam(required = false) String token,
            HttpServletRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        grupoBoletoService.eliminarGrupo(rifaId, grupoId, usuarioId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Contar boletos en un grupo
     */
    @GetMapping("/{grupoId}/contar")
    public ResponseEntity<Map<String, Integer>> contarBoletosEnGrupo(
            @PathVariable Long rifaId,
            @PathVariable Long grupoId,
            @RequestParam(required = false) String token,
            HttpServletRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        Integer cantidad = grupoBoletoService.contarBoletosEnGrupo(rifaId, grupoId, usuarioId);
        return ResponseEntity.ok(Map.of("cantidad", cantidad));
    }
}
