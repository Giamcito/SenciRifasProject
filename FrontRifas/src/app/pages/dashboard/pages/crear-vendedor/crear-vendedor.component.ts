import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vendedor, VendedorService } from '../../../../services/vendedor.service';

@Component({
  selector: 'app-crear-vendedor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-vendedor.component.html',
  styleUrl: './crear-vendedor.component.css'
})
export class CrearVendedorComponent implements OnInit {
  form!: FormGroup;
  loading: boolean = false;
  mensaje: string = '';
  error: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private vendedorService: VendedorService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  /**
   * Inicializar el formulario reactivo
   */
  inicializarFormulario(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      numeroCelular: ['', [Validators.pattern(/^[0-9]{10,}$/)]],
      direccion: [''],
      parteDelDinero: ['', [
        Validators.required,
        Validators.required,
        Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)
      ]]
    });
  }

  /**
   * Crear vendedor
   */
  crearVendedor(): void {
    if (this.form.invalid) {
      this.error = 'Por favor completa todos los campos requeridos correctamente';
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const vendedor: Vendedor = this.form.value;

    this.vendedorService.crearVendedor(vendedor).subscribe({
      next: (respuesta: Vendedor) => {
        this.loading = false;
        this.successMessage = `✓ Vendedor "${respuesta.nombre}" creado exitosamente`;
        this.form.reset();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al crear vendedor';
      }
    });
  }

  /**
   * Limpiar formulario
   */
  limpiar(): void {
    this.form.reset();
    this.error = '';
    this.successMessage = '';
  }

  /**
   * Obtener errores del campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
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
        return 'El número de celular debe tener al menos 10 dígitos';
      }
      if (fieldName === 'parteDelDinero') {
        return 'Ingresa un monto válido (ej: 50000 o 50000.50)';
      }
    }
    return 'Campo inválido';
  }

  /**
   * Formatear nombre del campo para mostrar en errores
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

