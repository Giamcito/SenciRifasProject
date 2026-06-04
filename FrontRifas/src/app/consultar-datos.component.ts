import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Boleto, EstadoVenta } from './models/boleto';
import { Rifa } from './models/rifa';
import { BoletoService, ConsultaVendedor } from './services/boleto.service';
import { RifaService } from './services/rifa.service';
import { Vendedor, VendedorService } from './services/vendedor.service';

interface ResumenVendedorConsulta {
  vendedorId: number;
  vendedorNombre: string;
  dineroRecogido: number;
  dineroRetirado: number;
  dineroAbonos: number;
}

@Component({
  selector: 'app-consultar-datos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pages/dashboard/pages/consultar-datos/consultar-datos.component.html',
  styleUrl: './pages/dashboard/pages/consultar-datos/consultar-datos.component.css'
})
export class ConsultarDatosComponent implements OnInit {
  readonly boletosPorPagina = 100;
  rifaId: number | null = null;
  rifa: Rifa | null = null;
  rifas: Rifa[] = [];
  vendedores: Vendedor[] = [];
  selectedVendedorId: number | null = null;
  selectedRifaId: number | null = null;
  selectedEstado: EstadoVenta | 'TODOS' = 'TODOS';
  busquedaNumero = '';
  paginaBoletos = 0;
  consulta: ConsultaVendedor | null = null;
  resumenVendedores: ResumenVendedorConsulta[] = [];
  resumenGeneral = {
    dineroRecogido: 0,
    dineroRecogidoVendedores: 0,
    dineroAbonos: 0
  };
  loading = false;
  loadingRifas = false;
  loadingConsulta = false;
  loadingResumenVendedores = false;
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
        this.intentarCargarResumenVendedores();
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
        const seleccionadosPrevios = new Set(
          this.vendedores.filter((vendedor) => vendedor.seleccionado && vendedor.id != null).map((vendedor) => vendedor.id as number)
        );

        this.vendedores = vendedores.map((vendedor) => ({
          ...vendedor,
          seleccionado: seleccionadosPrevios.size > 0 ? seleccionadosPrevios.has(vendedor.id ?? -1) : true
        }));

        if (!this.selectedVendedorId && this.vendedores.length > 0) {
          this.selectedVendedorId = this.vendedores[0].id ?? null;
        }

        this.intentarCargarConsulta();
        this.intentarCargarResumenVendedores();
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

  intentarCargarResumenVendedores(): void {
    if (!this.rifaId || this.loading || this.loadingRifas || this.vendedores.length === 0 || !this.rifa) {
      return;
    }

    this.cargarResumenVendedores();
  }

  cargarConsulta(): void {
    if (!this.rifaId || !this.selectedVendedorId) {
      this.consulta = null;
      return;
    }

    this.loadingConsulta = true;
    this.error = '';
    this.paginaBoletos = 0;

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

  cargarResumenVendedores(): void {
    if (!this.rifaId || this.vendedores.length === 0) {
      this.resumenVendedores = [];
      this.resumenGeneral = { dineroRecogido: 0, dineroRecogidoVendedores: 0, dineroAbonos: 0 };
      return;
    }

    const vendedoresConId = this.vendedores.filter((vendedor): vendedor is Vendedor & { id: number } => vendedor.id != null);

    if (vendedoresConId.length === 0) {
      this.resumenVendedores = [];
      this.resumenGeneral = { dineroRecogido: 0, dineroRecogidoVendedores: 0, dineroAbonos: 0 };
      return;
    }

    this.loadingResumenVendedores = true;

    forkJoin(
      vendedoresConId.map((vendedor) =>
        this.boletoService.obtenerConsultaVendedor(this.rifaId!, vendedor.id, 'TODOS').pipe(
          catchError(() => of(null))
        )
      )
    ).subscribe({
      next: (consultas) => {
        const resumenes = consultas
          .map((consulta, index) => {
            const vendedor = vendedoresConId[index];
            if (!consulta) {
              return null;
            }

            return {
                  vendedorId: vendedor.id,
                  vendedorNombre: vendedor.nombre,
              dineroRecogido: Number(consulta.dineroRecogido || 0),
                  dineroRetirado: Number((consulta as any).dineroRetirado || 0),
                  dineroAbonos: this.calcularDineroAbonos(consulta)
                } as ResumenVendedorConsulta;
          })
          .filter((resumen): resumen is ResumenVendedorConsulta => resumen !== null);

        this.resumenVendedores = resumenes;
        this.recalcularResumenGeneral();
        this.loadingResumenVendedores = false;
      },
      error: () => {
        this.resumenVendedores = [];
        this.resumenGeneral = { dineroRecogido: 0, dineroRecogidoVendedores: 0, dineroAbonos: 0 };
        this.loadingResumenVendedores = false;
      }
    });
  }

  calcularDineroAbonos(consulta: ConsultaVendedor): number {
    const boletos = consulta.boletos || [];
    let total = 0;
    const gruposContabilizados = new Set<number>();

    for (const boleto of boletos) {
      if (!boleto.grupoId) {
        if (boleto.estadoVenta === 'ABONADO') {
          total += Number(boleto.montoAbonado || 0);
        }
        continue;
      }

      if (gruposContabilizados.has(boleto.grupoId)) {
        continue;
      }

      // Si la agrupación ya fue vendida completamente, no la contamos como abono
      const grupoEstado = (boleto as any).grupoEstadoVenta;
      if (grupoEstado === 'VENDIDO') {
        gruposContabilizados.add(boleto.grupoId);
        continue;
      }

      gruposContabilizados.add(boleto.grupoId);
      // Preferir monto abonado del grupo cuando exista
      const montoGrupo = (boleto as any).grupoMontoAbonado ?? boleto.montoAbonado ?? 0;
      total += Number(montoGrupo || 0);
    }

    return total;
  }

  recalcularResumenGeneral(): void {
    const vendedoresSeleccionados = this.vendedores.filter((vendedor) => vendedor.seleccionado && vendedor.id != null);
    const resumenesPorVendedor = new Map(this.resumenVendedores.map((resumen) => [resumen.vendedorId, resumen]));

    this.resumenGeneral = {
      dineroRecogido: vendedoresSeleccionados.reduce((total, vendedor) => total + Number(vendedor.parteDelDinero || 0), 0),
      dineroRecogidoVendedores: vendedoresSeleccionados.reduce((total, vendedor) => {
        const resumen = resumenesPorVendedor.get(vendedor.id as number);
        return total + Number(resumen?.dineroRecogido || 0);
      }, 0),
      dineroAbonos: vendedoresSeleccionados.reduce((total, vendedor) => {
        const resumen = resumenesPorVendedor.get(vendedor.id as number);
        return total + Number(resumen?.dineroAbonos || 0);
      }, 0)
    };
  }

  actualizarSeleccionVendedor(): void {
    this.recalcularResumenGeneral();
  }

  obtenerBoletosFiltrados(): Boleto[] {
    const boletos = this.consulta?.boletos ?? [];
    const busqueda = this.busquedaNumero.trim().toLowerCase();

    if (!busqueda) {
      return boletos;
    }

    return boletos.filter((boleto) => boleto.numero.toLowerCase().includes(busqueda));
  }

  obtenerBoletosVisibles(): Boleto[] {
    const boletosFiltrados = this.obtenerBoletosFiltrados();
    const inicio = this.paginaBoletos * this.boletosPorPagina;
    const fin = inicio + this.boletosPorPagina;

    return boletosFiltrados.slice(inicio, fin);
  }

  obtenerTotalPaginasBoletos(): number {
    const totalFiltrados = this.obtenerBoletosFiltrados().length;
    return Math.max(Math.ceil(totalFiltrados / this.boletosPorPagina), 1);
  }

  irAPaginaBoletos(pagina: number): void {
    const totalPaginas = this.obtenerTotalPaginasBoletos();
    if (pagina < 0 || pagina >= totalPaginas) {
      return;
    }

    this.paginaBoletos = pagina;
  }

  paginaAnteriorBoletos(): void {
    this.irAPaginaBoletos(this.paginaBoletos - 1);
  }

  paginaSiguienteBoletos(): void {
    this.irAPaginaBoletos(this.paginaBoletos + 1);
  }

  reiniciarPaginacionBoletos(): void {
    this.paginaBoletos = 0;
  }

  rangoVisibleBoletos(): string {
    const totalFiltrados = this.obtenerBoletosFiltrados().length;
    if (totalFiltrados === 0) {
      return '0 de 0';
    }

    const inicio = this.paginaBoletos * this.boletosPorPagina + 1;
    const fin = Math.min(inicio + this.boletosPorPagina - 1, totalFiltrados);
    return `${inicio}-${fin} de ${totalFiltrados}`;
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

  trackByResumenVendedor(index: number, resumen: ResumenVendedorConsulta): number {
    return resumen.vendedorId;
  }

  trackByVendedorId(index: number, vendedor: Vendedor): number {
    return vendedor.id ?? index;
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
