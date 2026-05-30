import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Rifa } from '../../../../models/rifa';
import { BoletoService } from '../../../../services/boleto.service';
import { RifaService } from '../../../../services/rifa.service';

@Component({
  selector: 'app-administrar-rifas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './administrar-rifas.component.html',
  styleUrl: './administrar-rifas.component.css'
})
export class AdministrarRifasComponent implements OnInit {
  rifas: Rifa[] = [];
  loading: boolean = false;
  error: string = '';
  successMessage: string = '';
  editingId: number | null = null;
  editingData: any = {};
  selectedRifaId: number | null = null;

  constructor(
    private rifaService: RifaService,
    private boletoService: BoletoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  generarBoletos(rifaId: number) {
    if (!confirm('Generar todos los boletos para esta rifa? Esto puede tardar.')) return;
    this.boletoService.generarBoletos(rifaId).subscribe({
      next: () => {
        this.successMessage = 'Boletos generados correctamente';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.error = err?.status === 409
          ? 'Esta rifa ya tiene boletos generados y no se pueden volver a generar.'
          : 'Error generando boletos';
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.selectedRifaId = id ? Number(id) : null;
      this.cargarRifasDesdeServidor();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.enfocarRifaSeleccionada(), 0);
  }

  private enfocarRifaSeleccionada(): void {
    if (!this.selectedRifaId) {
      return;
    }

    setTimeout(() => {
      const elemento = document.getElementById(`rifa-${this.selectedRifaId}`);
      elemento?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  cargarRifas(): void {
    this.cargarRifasDesdeServidor();
  }

  private cargarRifasDesdeServidor(): void {
    this.loading = true;
    this.error = '';

    this.rifaService.obtenerRifas().subscribe({
      next: (data) => {
        this.rifas = data;
        this.loading = false;
        this.enfocarRifaSeleccionada();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar las rifas';
      }
    });
  }

  editarRifa(rifa: Rifa): void {
    this.editingId = rifa.id;
    this.editingData = { ...rifa };
  }

  cancelarEdicion(): void {
    this.editingId = null;
    this.editingData = {};
  }

  guardarEdicion(): void {
    if (!this.editingId) return;

    this.rifaService.actualizarRifa(this.editingId, {
      nombre: this.editingData.nombre,
      cantidadBoletos: parseInt(this.editingData.cantidadBoletos, 10),
      valorBoleto: parseFloat(this.editingData.valorBoleto)
    }).subscribe({
      next: (rifaActualizada) => {
        const index = this.rifas.findIndex(r => r.id === this.editingId);
        if (index > -1) {
          this.rifas[index] = rifaActualizada;
        }
        this.editingId = null;
        this.editingData = {};
        this.successMessage = 'Rifa actualizada exitosamente';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.error = 'Error al actualizar la rifa';
      }
    });
  }

  eliminarRifa(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta rifa?')) {
      return;
    }

    this.rifaService.eliminarRifa(id).subscribe({
      next: () => {
        this.rifas = this.rifas.filter(r => r.id !== id);
        this.successMessage = 'Rifa eliminada exitosamente';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.error = 'Error al eliminar la rifa';
      }
    });
  }

  verRifa(rifaId: number): void {
    this.router.navigate(['/dashboard/visualizar-rifas', rifaId]);
  }

  esRifaSeleccionada(rifaId: number): boolean {
    return this.selectedRifaId === rifaId;
  }

  obtenerCantidadCifras(cantidad: number): number {
    return cantidad.toString().length;
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(valor);
  }
}
