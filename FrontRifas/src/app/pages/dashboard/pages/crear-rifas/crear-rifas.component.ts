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
      valorBoleto: ['', [Validators.required, Validators.min(0.01)]],
      gruposHabilitado: [false],
      cantidadAgrupacion: [{ value: '', disabled: true }, [Validators.required, this.validarNumeroPositivo]]
    });
  }

  ngOnInit(): void {
    const gruposControl = this.form.get('gruposHabilitado');
    gruposControl?.valueChanges.subscribe((habilitado) => {
      const cantidadAgrupacion = this.form.get('cantidadAgrupacion');

      if (habilitado) {
        cantidadAgrupacion?.enable({ emitEvent: false });
        cantidadAgrupacion?.setValidators([Validators.required, this.validarNumeroPositivo]);
      } else {
        cantidadAgrupacion?.reset('');
        cantidadAgrupacion?.disable({ emitEvent: false });
        cantidadAgrupacion?.clearValidators();
      }

      cantidadAgrupacion?.updateValueAndValidity({ emitEvent: false });
    });
  }

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

    const rifaData: any = {
      nombre: this.form.value.nombre,
      cantidadBoletos: parseInt(this.form.value.cantidadBoletos, 10),
      valorBoleto: parseFloat(this.form.value.valorBoleto),
      gruposHabilitado: this.form.value.gruposHabilitado || false,
      cantidadAgrupacion: this.form.value.gruposHabilitado
        ? parseInt(this.form.getRawValue().cantidadAgrupacion, 10)
        : null
    };

    this.rifaService.crearRifa(rifaData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Rifa creada exitosamente';
        this.form.reset({ gruposHabilitado: false, cantidadAgrupacion: '' });
        this.form.get('cantidadAgrupacion')?.disable({ emitEvent: false });
        
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
    this.form.reset({ gruposHabilitado: false, cantidadAgrupacion: '' });
    this.form.get('cantidadAgrupacion')?.disable({ emitEvent: false });
    this.error = '';
    this.successMessage = '';
  }

  esAgrupacionActiva(): boolean {
    return !!this.form.get('gruposHabilitado')?.value;
  }

  getPotencialTotal(): number {
    const cantidadBoletos = Number(this.form.get('cantidadBoletos')?.value || 0);
    const valorBoleto = Number(this.form.get('valorBoleto')?.value || 0);
    return cantidadBoletos * valorBoleto;
  }

  getPotencialMostrado(): number {
    const total = this.getPotencialTotal();

    if (!this.esAgrupacionActiva()) {
      return total;
    }

    const cantidadAgrupacion = Number(this.form.getRawValue().cantidadAgrupacion || 0);
    if (cantidadAgrupacion <= 0) {
      return total;
    }

    return total / cantidadAgrupacion;
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor || 0);
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

