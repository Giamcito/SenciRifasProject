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
      generarBoletos: [true],
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

  /**
   * Calcula la cantidad exacta de cifras necesarias según la cantidad de boletas.
   * Al numerarse de 0 a (N - 1), el número máximo es (N - 1).
   * Ejemplos:
   * 1000 boletas -> de 000 a 999 -> 3 cifras
   * 10000 boletas -> de 0000 a 9999 -> 4 cifras
   * 100000 boletas -> de 00000 a 99999 -> 5 cifras
   * 500 boletas -> de 000 a 499 -> 3 cifras
   * 50 boletas -> de 00 a 49 -> 2 cifras
   * 5000 boletas -> de 0000 a 4999 -> 4 cifras
   */
  getCifras(): number {
    const raw = this.form.get('cantidadBoletos')?.value;
    const cantidad = Number(raw);
    if (!raw || isNaN(cantidad) || cantidad <= 1) {
      return 1;
    }
    return (cantidad - 1).toString().length;
  }

  getPrimerBoleto(): string {
    return '0'.padStart(this.getCifras(), '0');
  }

  getUltimoBoleto(): string {
    const raw = this.form.get('cantidadBoletos')?.value;
    const cantidad = Number(raw);
    if (!raw || isNaN(cantidad) || cantidad <= 1) {
      return '0'.padStart(this.getCifras(), '0');
    }
    return (cantidad - 1).toString().padStart(this.getCifras(), '0');
  }

  crearRifa(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const cantidad = parseInt(this.form.value.cantidadBoletos, 10);
    const cifras = this.getCifras();
    const generarBoletos = this.form.value.generarBoletos !== false;

    const rifaData: any = {
      nombre: this.form.value.nombre,
      cantidadBoletos: cantidad,
      valorBoleto: parseFloat(this.form.value.valorBoleto),
      cifras: cifras,
      generarBoletos: generarBoletos,
      gruposHabilitado: this.form.value.gruposHabilitado || false,
      cantidadAgrupacion: this.form.value.gruposHabilitado
        ? parseInt(this.form.getRawValue().cantidadAgrupacion, 10)
        : null
    };

    this.rifaService.crearRifa(rifaData).subscribe({
      next: (response) => {
        this.loading = false;
        const rango = `${this.getPrimerBoleto()} al ${this.getUltimoBoleto()}`;
        this.successMessage = generarBoletos
          ? `Rifa "${response.nombre}" creada exitosamente con ${cantidad.toLocaleString('es-CO')} boletos de ${cifras} cifras (${rango}) generados.`
          : `Rifa "${response.nombre}" creada exitosamente (${cifras} cifras).`;

        this.form.reset({ gruposHabilitado: false, cantidadAgrupacion: '', generarBoletos: true });
        this.form.get('cantidadAgrupacion')?.disable({ emitEvent: false });
        
        // Auto-dismiss mensaje después de 5 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al crear la rifa';
      }
    });
  }

  limpiar(): void {
    this.form.reset({ gruposHabilitado: false, cantidadAgrupacion: '', generarBoletos: true });
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

