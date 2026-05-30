import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Boleto, EstadoVenta } from './models/boleto';
import { Rifa } from './models/rifa';
import { BoletoService, ConsultaVendedor } from './services/boleto.service';
import { RifaService } from './services/rifa.service';
import { Vendedor, VendedorService } from './services/vendedor.service';

@Component({
  selector: 'app-consultar-datos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pages/dashboard/pages/consultar-datos/consultar-datos.component.html',
  styleUrl: './pages/dashboard/pages/consultar-datos/consultar-datos.component.css'
})
export class ConsultarDatosComponent implements OnInit {
  rifaId: number | null = null;
  rifa: Rifa | null = null;
  rifas: Rifa[] = [];
  vendedores: Vendedor[] = [];
  selectedVendedorId: number | null = null;
  selectedRifaId: number | null = null;
  selectedEstado: EstadoVenta | 'TODOS' = 'TODOS';
  busquedaNumero = '';
  consulta: ConsultaVendedor | null = null;
  loading = false;
  loadingRifas = false;
  loadingConsulta = false;
  error = '';

  readonly estadoOpciones: Array<EstadoVenta | 'TODOS'> = ['TODOS', 'DISPONIBLE', 'ABONADO', 'VENDIDO', 'RESERVADO', 'CANCELADO'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rifaService: RifaService,
    private vendedorService: VendedorService,
    private boletoService: BoletoService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const rifaValue = params.get('rifaId');
      const vendedorValue = params.get('vendedorId');

      this.rifaId = rifaValue ? Number(rifaValue) : null;
      this.selectedRifaId = this.rifaId;
      this.selectedVendedorId = vendedorValue ? Number(vendedorValue) : null;

      this.cargarRifas();
      this.cargarVendedores();

      if (this.selectedRifaId) {
        this.cargarRifa();
      }
    });
  }

  cargarRifas(): void {
    this.loadingRifas = true;

    this.rifaService.obtenerRifas().subscribe({
      next: (rifas) => {
        this.rifas = rifas;
        this.loadingRifas = false;

        if (!this.selectedRifaId && this.rifas.length > 0) {
          this.selectedRifaId = this.rifas[0].id;
        }

        if (this.selectedRifaId && !this.rifa) {
          this.cargarRifaSeleccionada();
        }
      },
      error: () => {
        this.rifas = [];
        this.loadingRifas = false;
      }
    });
  }

  seleccionarRifa(): void {
    this.rifaId = this.selectedRifaId;
    this.rifa = null;
    this.consulta = null;

    if (!this.rifaId) {
      return;
    }

    this.cargarRifaSeleccionada();
  }

  private cargarRifaSeleccionada(): void {
    if (!this.selectedRifaId) {
      return;
    }

    this.rifaId = this.selectedRifaId;
    this.cargarRifa();
  }

  cargarRifa(): void {
    if (!this.rifaId) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.rifaService.obtenerRifa(this.rifaId).subscribe({
      next: (rifa) => {
        this.rifa = rifa;
        this.loading = false;
        this.intentarCargarConsulta();
      },
      error: () => {
        this.rifa = null;
        this.loading = false;
        this.error = 'No se pudo cargar la rifa seleccionada';
      }
    });
  }

  cargarVendedores(): void {
    this.vendedorService.obtenerVendedores().subscribe({
      next: (vendedores) => {
        this.vendedores = vendedores;
        if (!this.selectedVendedorId && this.vendedores.length > 0) {
          this.selectedVendedorId = this.vendedores[0].id ?? null;
        }
        this.intentarCargarConsulta();
      },
      error: () => {
        this.vendedores = [];
        this.consulta = null;
      }
    });
  }

  intentarCargarConsulta(): void {
    if (!this.rifaId || !this.selectedVendedorId || this.loading) {
      return;
    }

    this.cargarConsulta();
  }

  cargarConsulta(): void {
    if (!this.rifaId || !this.selectedVendedorId) {
      this.consulta = null;
      return;
    }

    this.loadingConsulta = true;
    this.error = '';

    this.boletoService.obtenerConsultaVendedor(this.rifaId, this.selectedVendedorId, this.selectedEstado).subscribe({
      next: (consulta) => {
        this.consulta = consulta;
        this.loadingConsulta = false;
      },
      error: () => {
        this.consulta = null;
        this.loadingConsulta = false;
        this.error = 'No se pudo cargar la consulta del vendedor';
      }
    });
  }

  obtenerBoletosFiltrados(): Boleto[] {
    const boletos = this.consulta?.boletos ?? [];
    const busqueda = this.busquedaNumero.trim().toLowerCase();

    if (!busqueda) {
      return boletos;
    }

    return boletos.filter((boleto) => boleto.numero.toLowerCase().includes(busqueda));
  }

  trackByBoletoId(index: number, boleto: Boleto): number {
    return boleto.id;
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(valor || 0);
  }

  colorEstado(estado: EstadoVenta): string {
    switch (estado) {
      case 'VENDIDO':
        return '#e74c3c';
      case 'ABONADO':
      case 'RESERVADO':
        return '#f39c12';
      case 'DISPONIBLE':
        return '#27ae60';
      case 'CANCELADO':
        return '#64748b';
      default:
        return '#94a3b8';
    }
  }

  volverAdministracion(): void {
    this.router.navigate(['/dashboard/administrar-rifas']);
  }

  tieneRifaSeleccionada(): boolean {
    return !!this.rifaId && !!this.rifa;
  }
}
