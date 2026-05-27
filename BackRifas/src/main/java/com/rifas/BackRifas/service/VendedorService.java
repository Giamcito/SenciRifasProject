package com.rifas.BackRifas.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rifas.BackRifas.dto.CreateVendedorRequest;
import com.rifas.BackRifas.dto.VendedorDTO;
import com.rifas.BackRifas.model.Vendedor;
import com.rifas.BackRifas.repository.VendedorRepository;

@Service
public class VendedorService {
    @Autowired
    private VendedorRepository vendedorRepository;

    /**
     * Crear un nuevo vendedor
     */
    public VendedorDTO crearVendedor(CreateVendedorRequest request, Long usuarioId) {
        Vendedor vendedor = new Vendedor();
        vendedor.setNombre(request.getNombre());
        vendedor.setNumeroCelular(request.getNumeroCelular());
        vendedor.setDireccion(request.getDireccion());
        vendedor.setParteDelDinero(request.getParteDelDinero());
        vendedor.setUsuarioId(usuarioId);

        Vendedor vendedorGuardado = vendedorRepository.save(vendedor);
        return convertirADTO(vendedorGuardado);
    }

    /**
     * Obtener todos los vendedores del usuario
     */
    public List<VendedorDTO> obtenerVendedoresDelUsuario(Long usuarioId) {
        return vendedorRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener un vendedor por ID
     */
    public VendedorDTO obtenerVendedor(Long id, Long usuarioId) {
        Vendedor vendedor = vendedorRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));
        return convertirADTO(vendedor);
    }

    /**
     * Actualizar un vendedor
     */
    public VendedorDTO actualizarVendedor(Long id, CreateVendedorRequest request, Long usuarioId) {
        Vendedor vendedor = vendedorRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));

        vendedor.setNombre(request.getNombre());
        vendedor.setNumeroCelular(request.getNumeroCelular());
        vendedor.setDireccion(request.getDireccion());
        vendedor.setParteDelDinero(request.getParteDelDinero());

        Vendedor vendedorActualizado = vendedorRepository.save(vendedor);
        return convertirADTO(vendedorActualizado);
    }

    /**
     * Eliminar un vendedor
     */
    public void eliminarVendedor(Long id, Long usuarioId) {
        Vendedor vendedor = vendedorRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));
        vendedorRepository.delete(vendedor);
    }

    /**
     * Convertir entidad a DTO
     */
    private VendedorDTO convertirADTO(Vendedor vendedor) {
        return new VendedorDTO(
                vendedor.getId(),
                vendedor.getNombre(),
                vendedor.getNumeroCelular(),
                vendedor.getDireccion(),
                vendedor.getParteDelDinero()
        );
    }
}
