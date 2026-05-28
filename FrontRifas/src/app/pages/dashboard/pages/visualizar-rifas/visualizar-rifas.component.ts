import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Boleto, Estadisticas, EstadoVenta } from '../../../../models/boleto';
import { Rifa } from '../../../../models/rifa';
import { BoletoService } from '../../../../services/boleto.service';
import { RifaService } from '../../../../services/rifa.service';

@Component({
  selector: 'app-visualizar-rifas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizar-rifas.component.html',
  styleUrls: ['./visualizar-rifas.component.css']
})
export class VisualizarRifasComponent implements OnInit {
  rifaId: number | null = null;
  rifa: Rifa | null = null;
  boletos: Boleto[] = [];
  estadisticas: Estadisticas | null = null;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  
  filtroEstado: EstadoVenta | 'TODOS' = 'TODOS';
  busquedaNumero: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boletoService: BoletoService,
    private rifaService: RifaService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.rifaId = params['id'];
      if (this.rifaId) {
        this.cargarDatos();
      }
    });
  }

  cargarDatos(): void {
    if (!this.rifaId) return;

    this.loading = true;
    this.error = '';

    // Cargar rifa
    this.rifaService.obtenerRifa(this.rifaId).subscribe({
      next: (rifa: Rifa) => {
        this.rifa = rifa;
        // Cargar boletos y estadísticas
        this.cargarBoletos();
        this.cargarEstadisticas();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Error al cargar la rifa';
      }
    });
  }

  cargarBoletos(): void {
    if (!this.rifaId) return;

    this.boletoService.obtenerBoletos(this.rifaId).subscribe({
      next: (boletos: Boleto[]) => {
        this.boletos = boletos;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Error al cargar los boletos';
      }
    });
  }

  cargarEstadisticas(): void {
    if (!this.rifaId) return;

    this.boletoService.obtenerEstadisticas(this.rifaId).subscribe({
      next: (stats: Estadisticas) => {
        this.estadisticas = stats;
      },
      error: (err: any) => {
        this.error = 'Error al cargar estadísticas';
      }
    });
  }

  obtenerBoletosFiltrados(): Boleto[] {
    let filtrados = this.boletos;

    // Filtrar por estado
    if (this.filtroEstado !== 'TODOS') {
      filtrados = filtrados.filter(b => b.estadoVenta === this.filtroEstado);
    }

    // Filtrar por número
    if (this.busquedaNumero.trim()) {
      filtrados = filtrados.filter(b => b.numero.includes(this.busquedaNumero.trim()));
    }

    return filtrados;
  }

  cambiarEstado(boleto: Boleto, nuevoEstado: EstadoVenta): void {
    this.boletoService.actualizarBoleto(boleto.id, { estadoVenta: nuevoEstado }).subscribe({
      next: () => {
        this.success = `Boleto ${boleto.numero} actualizado a ${nuevoEstado}`;
        setTimeout(() => (this.success = ''), 3000);
        this.cargarBoletos();
        this.cargarEstadisticas();
      },
      error: (err: any) => {
        this.error = 'Error al actualizar boleto';
      }
    });
  }

  marcarVendido(boleto: Boleto): void {
    const email = prompt('Ingresa el email del comprador:', '');
    if (email) {
      this.boletoService.actualizarBoleto(boleto.id, { 
        estadoVenta: 'VENDIDO', 
        compradorEmail: email 
      }).subscribe({
        next: () => {
          this.success = `Boleto ${boleto.numero} marcado como vendido`;
          setTimeout(() => (this.success = ''), 3000);
          this.cargarBoletos();
          this.cargarEstadisticas();
        },
        error: (err: any) => {
          this.error = 'Error al actualizar boleto';
        }
      });
    }
  }

  obtenerColorPorEstado(estado: EstadoVenta): string {
    switch (estado) {
      case 'DISPONIBLE':
        return '#27ae60'; // Verde
      case 'VENDIDO':
        return '#e74c3c'; // Rojo
      case 'ABONADO':
      case 'RESERVADO':
        return '#f39c12'; // Amarillo
      case 'CANCELADO':
        return '#7f8c8d'; // Gris oscuro
      default:
        return '#95a5a6'; // Gris
    }
  }

  volver(): void {
    this.router.navigate(['/dashboard/administrar-rifas']);
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(valor);
  }
}
