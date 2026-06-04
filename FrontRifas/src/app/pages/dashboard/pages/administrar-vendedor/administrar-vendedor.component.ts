import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarService } from '../../../../services/sidebar.service';
import { Vendedor, VendedorService } from '../../../../services/vendedor.service';

@Component({
  selector: 'app-administrar-vendedor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './administrar-vendedor.component.html',
  styleUrl: './administrar-vendedor.component.css'
})
export class AdministrarVendedorComponent implements OnInit {
  vendedores: Vendedor[] = [];
  loading: boolean = true;
  editingId: number | null = null;
  editForm!: FormGroup;
  error: string = '';
  successMessage: string = '';
  modalVisible: boolean = false;
  modalLoading: boolean = false;
  modalTipo: 'confirmacion' | 'exito' | 'error' = 'confirmacion';
  modalTitulo: string = '';
  modalMensaje: string = '';
  modalVendedorId: number | null = null;
  modalVendedorName: string | null = null;

  constructor(
    private vendedorService: VendedorService,
    private fb: FormBuilder
    ,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.cargarVendedores();
  }

  /**
   * Cargar todos los vendedores del usuario
   */
  cargarVendedores(): void {
    this.loading = true;
    this.vendedorService.obtenerVendedores().subscribe({
      next: (data: Vendedor[]) => {
        this.vendedores = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al cargar vendedores';
        this.loading = false;
      }
    });
  }

  /**
   * Iniciar edición de un vendedor
   */
  iniciarEdicion(vendedor: Vendedor): void {
    this.editingId = vendedor.id!;
    this.editForm = this.fb.group({
      nombre: [vendedor.nombre, [Validators.required, Validators.minLength(3)]],
      numeroCelular: [vendedor.numeroCelular || '', [Validators.pattern(/^[0-9]{10,}$/)]],
      direccion: [vendedor.direccion || ''],
      parteDelDinero: [vendedor.parteDelDinero, [
        Validators.required,
        Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)
      ]]
    });
  }

  /**
   * Cancelar edición
   */
  cancelarEdicion(): void {
    this.editingId = null;
    this.editForm.reset();
  }

  /**
   * Guardar cambios en un vendedor
   */
  guardarCambios(): void {
    if (this.editForm.invalid || !this.editingId) {
      this.error = 'Por favor completa los campos correctamente';
      return;
    }

    this.vendedorService.actualizarVendedor(this.editingId, this.editForm.value).subscribe({
      next: (vendedorActualizado: Vendedor) => {
        const index = this.vendedores.findIndex(v => v.id === this.editingId);
        if (index > -1) {
          this.vendedores[index] = vendedorActualizado;
        }
        this.successMessage = `✓ Vendedor actualizado correctamente`;
        this.editingId = null;
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al actualizar vendedor';
      }
    });
  }

  /**
   * Eliminar un vendedor
   */
  mostrarEliminarVendedor(id: number, nombre: string): void {
    this.modalVendedorId = id;
    this.modalVendedorName = nombre;
    this.modalAccionEliminar();
    this.modalTipo = 'confirmacion';
    this.modalTitulo = 'Eliminar vendedor';
    this.modalMensaje = `¿Estás seguro de que deseas eliminar a "${nombre}"? Esta acción no se puede deshacer.`;
    this.sidebarService.closeSidebar();
    this.modalVisible = true;
    this.modalLoading = false;
  }

  private modalAccionEliminar(): void {
    // placeholder if other setup needed
  }

  confirmarEliminacionVendedor(): void {
    if (!this.modalVendedorId) return;
    const id = this.modalVendedorId;
    this.modalLoading = true;
    this.vendedorService.eliminarVendedor(id).subscribe({
      next: () => {
        this.modalLoading = false;
        this.modalTipo = 'exito';
        this.modalTitulo = 'Vendedor eliminado';
        this.modalMensaje = `El vendedor "${this.modalVendedorName}" se eliminó correctamente.`;
        this.vendedores = this.vendedores.filter(v => v.id !== id);
        this.successMessage = `✓ Vendedor "${this.modalVendedorName}" eliminado`;
        setTimeout(() => { this.successMessage = ''; }, 2000);
      },
      error: (err) => {
        this.modalLoading = false;
        this.modalTipo = 'error';
        this.modalTitulo = 'No se pudo eliminar';
        this.modalMensaje = err.error?.error || 'Error al eliminar vendedor';
      }
    });
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.modalLoading = false;
    this.modalTipo = 'confirmacion';
    this.modalTitulo = '';
    this.modalMensaje = '';
    this.modalVendedorId = null;
    this.modalVendedorName = null;
  }

  /**
   * Obtener errores del campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.formatearNombre(fieldName)} es requerido`;
    }
    if (field.errors['minLength']) {
      return `${this.formatearNombre(fieldName)} debe tener al menos ${field.errors['minLength'].requiredLength} caracteres`;
    }
    if (field.errors['pattern']) {
      if (fieldName === 'numeroCelular') {
        return 'El número debe tener al menos 10 dígitos';
      }
      if (fieldName === 'parteDelDinero') {
        return 'Ingresa un monto válido';
      }
    }
    return 'Campo inválido';
  }

  /**
   * Formatear nombre del campo
   */
  private formatearNombre(fieldName: string): string {
    const nombres: { [key: string]: string } = {
      nombre: 'Nombre',
      numeroCelular: 'Número de celular',
      direccion: 'Dirección',
      parteDelDinero: 'Parte del dinero'
    };
    return nombres[fieldName] || fieldName;
  }
}

