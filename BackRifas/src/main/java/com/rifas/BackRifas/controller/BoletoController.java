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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rifas.BackRifas.dto.AsignarPropietarioRequest;
import com.rifas.BackRifas.dto.BoletoDTO;
import com.rifas.BackRifas.dto.BoletoPageDTO;
import com.rifas.BackRifas.dto.ConsultaVendedorDTO;
import com.rifas.BackRifas.dto.CreateBoletoRequest;
import com.rifas.BackRifas.dto.PagoRequest;
import com.rifas.BackRifas.model.EstadoVenta;
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
     * Obtener boletos de una rifa paginados
     */
    @GetMapping("/{rifaId}/boletos")
    public ResponseEntity<BoletoPageDTO> obtenerBoletos(
            @PathVariable Long rifaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "500") int size,
            @RequestParam(required = false) EstadoVenta estado,
            HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            BoletoPageDTO boletos = boletoService.obtenerBoletosPaginados(rifaId, usuarioId, page, size, estado);
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
     * Obtener un boleto específico por número con autenticación
     */
    @GetMapping("/{rifaId}/boletos/numero/{numero}")
    public ResponseEntity<?> obtenerBoletoPorNumero(@PathVariable Long rifaId, @PathVariable String numero, HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            BoletoDTO boleto = boletoService.obtenerBoletoPorNumero(rifaId, usuarioId, numero);
            return ResponseEntity.ok(boleto);
        } catch (RuntimeException e) {
            return manejarError(e);
        }
    }

    /**
     * Endpoint público temporal para depuración: obtener boletos sin auth
     */
    @GetMapping("/public/{rifaId}/boletos")
    public ResponseEntity<List<BoletoDTO>> obtenerBoletosPublico(@PathVariable Long rifaId) {
        try {
            List<BoletoDTO> boletos = boletoService.obtenerBoletosPublico(rifaId);
            return ResponseEntity.ok(boletos);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint público temporal para depuración: obtener un boleto por número
     */
    @GetMapping("/public/{rifaId}/boletos/{numero}")
    public ResponseEntity<BoletoDTO> obtenerBoletoPublicoPorNumero(@PathVariable Long rifaId, @PathVariable String numero) {
        try {
            BoletoDTO boleto = boletoService.obtenerBoletoPorNumeroPublico(rifaId, numero);
            return ResponseEntity.ok(boleto);
        } catch (RuntimeException e) {
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
            if (msg.contains("ya fueron generados")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Actualizar estado de un boleto
     */
    @PutMapping("/{rifaId}/boletos/{boletoId}")
    public ResponseEntity<BoletoDTO> actualizarBoleto(@PathVariable Long rifaId, @PathVariable Long boletoId, 
                                                      @Valid @RequestBody CreateBoletoRequest request,
                                                      HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            BoletoDTO boletoDTO = boletoService.actualizarEstadoBoleto(rifaId, boletoId, request, usuarioId);
            return ResponseEntity.ok(boletoDTO);
        } catch (RuntimeException e) {
            String msg = e.getMessage() == null ? "" : e.getMessage().toLowerCase();
            if (msg.contains("token") || msg.contains("inválid") || msg.contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            if (msg.contains("no pertenece")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Aplicar abono parcial a un boleto
     */
    @PostMapping("/{rifaId}/boletos/{boletoId}/abono")
    public ResponseEntity<?> abonarBoleto(@PathVariable Long rifaId, @PathVariable Long boletoId,
                                                  @RequestBody PagoRequest request,
                                                  HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            BoletoDTO updated = boletoService.aplicarAbono(rifaId, boletoId, request, usuarioId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return manejarError(e);
        }
    }

    /**
     * Pagar boleto completo
     */
    @PostMapping("/{rifaId}/boletos/{boletoId}/pago")
    public ResponseEntity<?> pagarBoleto(@PathVariable Long rifaId, @PathVariable Long boletoId,
                                                 @RequestBody PagoRequest request,
                                                 HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            BoletoDTO updated = boletoService.pagarCompleto(rifaId, boletoId, request, usuarioId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return manejarError(e);
        }
    }

    /**
     * Asignar propietario a un boleto sin modificar su estado
     */
    @PutMapping("/{rifaId}/boletos/{boletoId}/propietario")
    public ResponseEntity<?> asignarPropietario(@PathVariable Long rifaId, @PathVariable Long boletoId,
                                                @RequestBody AsignarPropietarioRequest request,
                                                HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            BoletoDTO updated = boletoService.asignarPropietario(rifaId, boletoId, request, usuarioId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return manejarError(e);
        }
    }

    /**
     * Obtener consulta de un vendedor dentro de una rifa
     */
    @GetMapping("/{rifaId}/consultas/vendedores/{vendedorId}")
    public ResponseEntity<?> obtenerConsultaVendedor(@PathVariable Long rifaId,
                                                     @PathVariable Long vendedorId,
                                                     @RequestParam(required = false) EstadoVenta estado,
                                                     HttpServletRequest httpRequest) {
        try {
            Long usuarioId = obtenerUsuarioIdDelToken(httpRequest);
            ConsultaVendedorDTO consulta = boletoService.obtenerConsultaVendedor(rifaId, vendedorId, usuarioId, estado);
            return ResponseEntity.ok(consulta);
        } catch (RuntimeException e) {
            return manejarError(e);
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

    private ResponseEntity<?> manejarError(RuntimeException e) {
        String mensaje = e.getMessage() == null ? "Error inesperado" : e.getMessage();
        String texto = mensaje.toLowerCase();

        if (texto.contains("token") || texto.contains("inválid")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mensaje);
        }
        if (texto.contains("no encontrado")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mensaje);
        }
        if (texto.contains("ya está vendido")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(mensaje);
        }
        if (texto.contains("no puede superar")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mensaje);
        }
        if (texto.contains("monto inválido") || texto.contains("no pertenece")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mensaje);
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mensaje);
    }
}
