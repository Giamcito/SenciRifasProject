import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RifaService } from '../../../../services/rifa.service';

@Component({
  selector: 'app-crear-rifas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-rifas.component.html',
  styleUrl: './crear-rifas.component.css'
})
export class CrearRifasComponent implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  error: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private rifaService: RifaService
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      cantidadBoletos: ['', [Validators.required, this.validarNumeroPositivo]],
      valorBoleto: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {}

  // Validador personalizado para números positivos enteros
  validarNumeroPositivo(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const valor = control.value.toString().trim();
    
    // Solo debe contener dígitos
    if (!/^\d+$/.test(valor)) {
      return { 'numeroInvalido': true };
    }

    const numero = parseInt(valor, 10);
    
    // Debe ser mayor o igual a 1
    if (numero < 1) {
      return { 'min': { min: 1 } };
    }

    return null;
  }

  crearRifa(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const rifaData = {
      nombre: this.form.value.nombre,
      cantidadBoletos: parseInt(this.form.value.cantidadBoletos, 10),
      valorBoleto: parseFloat(this.form.value.valorBoleto)
    };

    this.rifaService.crearRifa(rifaData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Rifa creada exitosamente';
        this.form.reset();
        
        // Auto-dismiss mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al crear la rifa';
      }
    });
  }

  limpiar(): void {
    this.form.reset();
    this.error = '';
    this.successMessage = '';
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return `${fieldName} es requerido`;
    }
    if (control.errors['minLength']) {
      return `${fieldName} debe tener al menos ${control.errors['minLength'].requiredLength} caracteres`;
    }
    if (control.errors['min']) {
      return `${fieldName} debe ser mayor a ${control.errors['min'].min}`;
    }
    if (control.errors['numeroInvalido']) {
      return `${fieldName} solo debe contener números`;
    }

    return 'Campo inválido';
  }
}

