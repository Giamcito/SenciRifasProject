package com.rifas.BackRifas.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rifas.BackRifas.dto.AuthResponse;
import com.rifas.BackRifas.dto.ChangePasswordRequest;
import com.rifas.BackRifas.dto.LoginRequest;
import com.rifas.BackRifas.dto.RegisterRequest;
import com.rifas.BackRifas.dto.UsuarioDTO;
import com.rifas.BackRifas.model.Usuario;
import com.rifas.BackRifas.repository.UsuarioRepository;
import com.rifas.BackRifas.util.JwtUtil;

@Service
public class AuthService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        // Validar que las contraseñas coincidan
        if (!request.getPassword().equals(request.getPassword_confirm())) {
            throw new RuntimeException("Las contraseñas no coinciden");
        }

        // Validar que el email no existe
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        // Crear nuevo usuario
        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));

        usuarioRepository.save(usuario);

        // Generar token
        String token = jwtUtil.generateToken(usuario.getEmail());

        return new AuthResponse(
            token,
            "Usuario registrado exitosamente",
            new UsuarioDTO(usuario.getId(), usuario.getUniqueId(), usuario.getNombre(), usuario.getEmail())
        );
    }

    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtUtil.generateToken(usuario.getEmail());

        return new AuthResponse(
            token,
            "Sesión iniciada exitosamente",
            new UsuarioDTO(usuario.getId(), usuario.getUniqueId(), usuario.getNombre(), usuario.getEmail())
        );
    }

    public AuthResponse changePassword(ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new RuntimeException("Las contraseñas nuevas no coinciden");
        }

        Usuario usuario = usuarioRepository.findByUniqueId(request.getUniqueId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(usuario);

        return new AuthResponse(
            null,
            "Contraseña actualizada exitosamente",
            new UsuarioDTO(usuario.getId(), usuario.getUniqueId(), usuario.getNombre(), usuario.getEmail())
        );
    }
}
