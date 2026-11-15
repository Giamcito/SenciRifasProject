import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Boleto, EstadoVenta } from '../../../../models/boleto';
import { Rifa } from '../../../../models/rifa';
import { BoletoService, ConsultaVendedor } from '../../../../services/boleto.service';
import { RifaService } from '../../../../services/rifa.service';
import { Vendedor, VendedorService } from '../../../../services/vendedor.service';

export interface GrupoConsulta {
  id: number;
  nombre: string;
  estadoVenta: EstadoVenta;
  vendedorId?: number | null;
  vendedorNombre?: string | null;
  compradorNombre?: string | null;
  compradorTelefono?: string | null;
  montoAbonado: number;
  saldoPendiente: number;
  fechaVenta?: string | null;
  boletos: Boleto[];
  numeros: string[];
}

@Component({
  selector: 'app-consultar-datos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultar-datos.component.html',
  styleUrl: './consultar-datos.component.css'
})
export class ConsultarDatosComponent implements OnInit {
  readonly boletosPorPagina = 20;
  readonly gruposPorPagina = 10;
  rifaId: number | null = null;
  rifa: Rifa | null = null;
  vendedores: Vendedor[] = [];
  selectedVendedorId: number | null = null;
  selectedEstado: EstadoVenta | 'TODOS' = 'TODOS';
  busquedaNumero = '';
  paginaBoletos = 0;
  paginaGrupos = 0;
  consulta: ConsultaVendedor | null = null;
  loading = false;
  loadingConsulta = false;
  error = '';

  readonly estadoOpciones: Array<{ valor: EstadoVenta | 'TODOS'; label: string }> = [
    { valor: 'TODOS', label: 'TODOS' },
    { valor: 'ASIGNADO', label: 'Asignados' },
    { valor: 'ABONADO', label: 'ABONADO' },
    { valor: 'VENDIDO', label: 'VENDIDO' }
  ];

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
    this.paginaBoletos = 0;
    this.paginaGrupos = 0;

    const estadoParam = (this.selectedEstado as string) === 'ASIGNADO' || (this.selectedEstado as string) === 'Asignados'
      ? 'DISPONIBLE'
      : this.selectedEstado;

    this.boletoService.obtenerConsultaVendedor(this.rifaId, this.selectedVendedorId, estadoParam).subscribe({
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

  obtenerGrupos(): GrupoConsulta[] {
    const boletos = this.consulta?.boletos ?? [];
    const gruposMap = new Map<number, GrupoConsulta>();

    for (const boleto of boletos) {
      if (!boleto.grupoId) {
        continue;
      }

      if (!gruposMap.has(boleto.grupoId)) {
        const estadoVentaGrupo = ((boleto as any).grupoEstadoVenta || boleto.estadoVenta) as EstadoVenta;
        gruposMap.set(boleto.grupoId, {
          id: boleto.grupoId,
          nombre: boleto.grupoNombre ? boleto.grupoNombre : `Agrupación #${boleto.grupoId}`,
          estadoVenta: estadoVentaGrupo,
          vendedorId: boleto.vendedorId,
          vendedorNombre: boleto.grupoVendedorNombre || boleto.vendedorNombre,
          compradorNombre: boleto.compradorNombre,
          compradorTelefono: boleto.compradorTelefono,
          montoAbonado: Number((boleto as any).grupoMontoAbonado ?? boleto.montoAbonado ?? 0),
          saldoPendiente: Number(boleto.grupoSaldoPendiente ?? 0),
          fechaVenta: boleto.fechaVenta,
          boletos: [],
          numeros: []
        });
      }

      const grupo = gruposMap.get(boleto.grupoId)!;
      grupo.boletos.push(boleto);
      grupo.numeros.push(boleto.numero);

      if (!grupo.compradorNombre && boleto.compradorNombre) {
        grupo.compradorNombre = boleto.compradorNombre;
      }
      if (!grupo.compradorTelefono && boleto.compradorTelefono) {
        grupo.compradorTelefono = boleto.compradorTelefono;
      }
      if (!grupo.fechaVenta && boleto.fechaVenta) {
        grupo.fechaVenta = boleto.fechaVenta;
      }
    }

    const resultado = Array.from(gruposMap.values());
    resultado.forEach((g) => {
      g.numeros.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    });
    return resultado;
  }

  tieneGrupos(): boolean {
    return (this.consulta?.boletos || []).some((b) => !!b.grupoId);
  }

  estadoVisualGrupo(grupo: GrupoConsulta): EstadoVenta {
    const estado = grupo.estadoVenta;
    if ((estado === 'DISPONIBLE' || (estado as any) === 'AGRUPADA') && (grupo.vendedorId || grupo.vendedorNombre)) {
      return 'ASIGNADO';
    }
    if ((estado as any) === 'AGRUPADA') {
      return 'ASIGNADO';
    }
    return estado;
  }

  obtenerGruposFiltrados(): GrupoConsulta[] {
    const grupos = this.obtenerGrupos();
    const busqueda = this.busquedaNumero.trim().toLowerCase();

    if (!busqueda) {
      return grupos;
    }

    return grupos.filter((grupo) =>
      grupo.nombre.toLowerCase().includes(busqueda) ||
      grupo.numeros.some((num) => num.toLowerCase().includes(busqueda)) ||
      (grupo.compradorNombre && grupo.compradorNombre.toLowerCase().includes(busqueda)) ||
      (grupo.compradorTelefono && grupo.compradorTelefono.toLowerCase().includes(busqueda))
    );
  }

  obtenerGruposVisibles(): GrupoConsulta[] {
    const filtrados = this.obtenerGruposFiltrados();
    const inicio = this.paginaGrupos * this.gruposPorPagina;
    const fin = inicio + this.gruposPorPagina;
    return filtrados.slice(inicio, fin);
  }

  obtenerTotalPaginasGrupos(): number {
    const totalFiltrados = this.obtenerGruposFiltrados().length;
    return Math.max(Math.ceil(totalFiltrados / this.gruposPorPagina), 1);
  }

  irAPaginaGrupos(pagina: number): void {
    const totalPaginas = this.obtenerTotalPaginasGrupos();
    if (pagina < 0 || pagina >= totalPaginas) {
      return;
    }
    this.paginaGrupos = pagina;
  }

  paginaAnteriorGrupos(): void {
    this.irAPaginaGrupos(this.paginaGrupos - 1);
  }

  paginaSiguienteGrupos(): void {
    this.irAPaginaGrupos(this.paginaGrupos + 1);
  }

  rangoVisibleGrupos(): string {
    const totalFiltrados = this.obtenerGruposFiltrados().length;
    if (totalFiltrados === 0) {
      return '0 de 0';
    }
    const inicio = this.paginaGrupos * this.gruposPorPagina + 1;
    const fin = Math.min(inicio + this.gruposPorPagina - 1, totalFiltrados);
    return `${inicio}-${fin} de ${totalFiltrados}`;
  }

  trackByGrupoId(index: number, grupo: GrupoConsulta): number {
    return grupo.id;
  }

  obtenerBoletosIndividuales(): Boleto[] {
    const boletos = this.consulta?.boletos ?? [];
    return boletos.filter((b) => !b.grupoId);
  }

  obtenerBoletosFiltrados(): Boleto[] {
    const boletos = this.obtenerBoletosIndividuales();
    const busqueda = this.busquedaNumero.trim().toLowerCase();

    if (!busqueda) {
      return boletos;
    }

    return boletos.filter((boleto) =>
      boleto.numero.toLowerCase().includes(busqueda) ||
      (boleto.compradorNombre && boleto.compradorNombre.toLowerCase().includes(busqueda)) ||
      (boleto.compradorTelefono && boleto.compradorTelefono.toLowerCase().includes(busqueda))
    );
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
    this.paginaGrupos = 0;
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
      case 'ASIGNADO':
        return '#8b5cf6';
      case 'DISPONIBLE':
        return '#27ae60';
      case 'CANCELADO':
        return '#64748b';
      default:
        return '#94a3b8';
    }
  }

  estadoVisual(boleto: Boleto): EstadoVenta {
    if (boleto.estadoVenta === 'DISPONIBLE' && boleto.vendedorId) {
      return 'ASIGNADO';
    }
    return boleto.estadoVenta;
  }

  volverAdministracion(): void {
    this.router.navigate(['/dashboard/administrar-rifas']);
  }
}