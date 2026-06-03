import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Boleto, EstadoVenta } from '../../../../models/boleto';
import { Rifa } from '../../../../models/rifa';
import { BoletoService, ConsultaVendedor } from '../../../../services/boleto.service';
import { RifaService } from '../../../../services/rifa.service';
import { Vendedor, VendedorService } from '../../../../services/vendedor.service';

@Component({
  selector: 'app-consultar-datos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultar-datos.component.html',
  styleUrl: './consultar-datos.component.css'
})
export class ConsultarDatosComponent implements OnInit {
  rifaId: number | null = null;
  rifa: Rifa | null = null;
  vendedores: Vendedor[] = [];
  selectedVendedorId: number | null = null;
  selectedEstado: EstadoVenta | 'TODOS' = 'TODOS';
  busquedaNumero = '';
  consulta: ConsultaVendedor | null = null;
  loading = false;
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
      this.selectedVendedorId = vendedorValue ? Number(vendedorValue) : null;

      if (this.rifaId) {
        this.cargarRifa();
        this.cargarVendedores();
      }
    });
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

  esBoletoAgrupado(boleto: Boleto): boolean {
    return !!boleto.grupoId;
  }

  saldoAgrupacion(boleto: Boleto): string {
    if (!boleto.grupoId) {
      return 'No aplica';
    }

    const saldo = boleto.grupoSaldoPendiente ?? 0;
    return this.formatoMoneda(saldo);
  }

  tipoAgrupacion(boleto: Boleto): string {
    if (!boleto.grupoId) {
      return 'Boleto individual';
    }

    return boleto.grupoNombre ? boleto.grupoNombre : `Agrupación #${boleto.grupoId}`;
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
}