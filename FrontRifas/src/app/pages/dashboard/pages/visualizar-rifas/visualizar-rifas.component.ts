import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Boleto, Estadisticas, EstadoVenta } from '../../../../models/boleto';
import { GrupoBoleto, Boleto as GrupoBoletoItem } from '../../../../models/grupo';
import { Rifa } from '../../../../models/rifa';
import { BoletoService } from '../../../../services/boleto.service';
import { GrupoService } from '../../../../services/grupo.service';
import { RifaService } from '../../../../services/rifa.service';
import { SidebarService } from '../../../../services/sidebar.service';
import { Vendedor, VendedorService } from '../../../../services/vendedor.service';

@Component({
  selector: 'app-visualizar-rifas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizar-rifas.component.html',
  styleUrls: ['./visualizar-rifas.component.css']
})
export class VisualizarRifasComponent implements OnInit {
  rifaKey: string = '';
  rifaId: number = 0;
  rifa: Rifa | null = null;
  boletos: Boleto[] = [];
  estadisticas: Estadisticas | null = null;
  loading: boolean = false;
  loadingBoletos: boolean = false;
  error: string = '';
  success: string = '';
  grupoBusqueda: GrupoBoleto | null = null;
  boletoBusqueda: Boleto | null = null;
  
  filtroEstado: EstadoVenta | 'TODOS' = 'TODOS';
  busquedaNumero: string = '';
  paginaActual: number = 0;
  tamanoPagina: number = 100;
  totalBoletos: number = 0;
  totalPaginas: number = 0;
  resumenBoletos: string = '';
  vendedores: Vendedor[] = [];
  showBoletoModal: boolean = false;
  modalModo: 'VENDER' | 'ABONAR' | 'PROPIETARIO' = 'VENDER';
  boletoModal?: Boleto;
  modalVendedorId?: number;
  modalCompradorNombre: string = '';
  modalCompradorTelefono: string = '';
  modalMonto: number | undefined;
  modalError: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boletoService: BoletoService,
    private grupoService: GrupoService,
    private rifaService: RifaService,
    private vendedorService: VendedorService
    ,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.rifaKey = String(params['rifaKey'] || '');
      if (this.rifaKey) {
        this.paginaActual = 0;
        this.cargarDatos();
      }
    });
  }

  cargarDatos(): void {
    if (!this.rifaKey) return;

    this.loading = true;
    this.error = '';

    const rifaIdFallback = Number(this.rifaKey);
    const cargarPorId = () => this.rifaService.obtenerRifa(rifaIdFallback);
    const cargaPrincipal = this.rifaKey && isNaN(Number(this.rifaKey))
      ? this.rifaService.obtenerRifaPorUniqueId(this.rifaKey)
      : cargarPorId();

    // Cargar rifa
    cargaPrincipal.subscribe({
      next: (rifa: Rifa) => {
        this.rifa = rifa;
        this.rifaId = rifa.id;
        this.grupoBusqueda = null;
        this.loading = false;
        this.cargarBoletos();
        this.cargarEstadisticas();
        this.cargarVendedores();
      },
      error: (err: any) => {
        if (this.rifaKey && !isNaN(Number(this.rifaKey))) {
          cargarPorId().subscribe({
            next: (rifa: Rifa) => {
              this.rifa = rifa;
              this.rifaId = rifa.id;
              this.grupoBusqueda = null;
              this.loading = false;
              this.cargarBoletos();
              this.cargarEstadisticas();
              this.cargarVendedores();
            },
            error: () => {
              this.loading = false;
              this.error = 'Error al cargar la rifa';
            }
          });
          return;
        }

        this.loading = false;
        this.error = 'Error al cargar la rifa';
      }
    });
  }

  cargarBoletos(): void {
    if (!this.rifaId) return;

    const numeroBuscado = this.normalizarNumeroBusqueda(this.busquedaNumero);

    if (numeroBuscado) {
      this.cargarResultadoBusqueda(numeroBuscado);
      return;
    }

    this.loadingBoletos = true;
    this.error = '';
    this.grupoBusqueda = null;
    this.boletoBusqueda = null;
    this.boletos = [];

    this.boletoService.obtenerBoletos(this.rifaId, {
      page: this.paginaActual,
      size: this.tamanoPagina,
      estado: this.filtroEstado
    }).subscribe({
      next: (pagina) => {
        this.boletos = pagina.content;
        this.totalBoletos = pagina.totalElements;
        this.totalPaginas = pagina.totalPages;
        this.loadingBoletos = false;
        this.actualizarResumenBoletos();
      },
      error: (err: any) => {
        this.loadingBoletos = false;
        this.error = 'Error al cargar los boletos';
      }
    });
  }

  private cargarResultadoBusqueda(numero: string): void {
    if (!this.rifaId) return;

    this.loadingBoletos = true;
    this.error = '';
    this.grupoBusqueda = null;
    this.boletoBusqueda = null;
    this.boletos = [];

    this.boletoService.obtenerBoletoPorNumero(this.rifaId, numero).subscribe({
      next: (boleto) => {
        const coincideFiltro = this.filtroEstado === 'TODOS' || boleto.estadoVenta === this.filtroEstado;
        if (!coincideFiltro) {
          this.loadingBoletos = false;
          this.totalBoletos = 0;
          this.totalPaginas = 0;
          this.actualizarResumenBoletos(0, numero);
          return;
        }

        if (this.rifa?.gruposHabilitado && boleto.grupoId) {
          this.cargarGrupoCompletoPorBoleto(boleto, numero);
          return;
        }

        this.boletoBusqueda = boleto;
        this.boletos = [boleto];
        this.totalBoletos = 1;
        this.totalPaginas = 1;
        this.loadingBoletos = false;
        this.actualizarResumenBoletos(1, numero);
      },
      error: () => {
        this.boletos = [];
        this.totalBoletos = 0;
        this.totalPaginas = 0;
        this.loadingBoletos = false;
        this.actualizarResumenBoletos(0, numero);
      }
    });
  }

  private cargarGrupoCompletoPorBoleto(boleto: Boleto, numero: string): void {
    if (!this.rifaId || !boleto.grupoId) {
      this.mostrarResultadoBoletoIndividual(boleto, numero);
      return;
    }

    const token = this.getToken();
    if (!token) {
      this.mostrarResultadoBoletoIndividual(boleto, numero);
      return;
    }

    this.grupoService.obtenerGrupo(this.rifaId, boleto.grupoId, token).subscribe({
      next: (grupo) => {
        this.grupoBusqueda = grupo;
        this.boletos = [];
        this.totalBoletos = grupo.boletos?.length ?? 0;
        this.totalPaginas = 1;
        this.loadingBoletos = false;
        this.actualizarResumenGrupo(grupo, numero);
      },
      error: () => {
        this.mostrarResultadoBoletoIndividual(boleto, numero);
      }
    });
  }

  private mostrarResultadoBoletoIndividual(boleto: Boleto, numero: string): void {
    const coincideFiltro = this.filtroEstado === 'TODOS' || boleto.estadoVenta === this.filtroEstado;
    this.boletoBusqueda = coincideFiltro ? boleto : null;
    this.grupoBusqueda = null;
    this.boletos = coincideFiltro ? [boleto] : [];
    this.totalBoletos = coincideFiltro ? 1 : 0;
    this.totalPaginas = 1;
    this.loadingBoletos = false;
    this.actualizarResumenBoletos(coincideFiltro ? 1 : 0, numero);
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

  cargarVendedores(): void {
    this.vendedorService.obtenerVendedores().subscribe({
      next: (vendedores) => {
        this.vendedores = vendedores;
      },
      error: () => {
        this.vendedores = [];
      }
    });
  }

  aplicarFiltros(): void {
    this.paginaActual = 0;
    this.cargarBoletos();
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'TODOS';
    this.busquedaNumero = '';
    this.paginaActual = 0;
    this.grupoBusqueda = null;
    this.boletoBusqueda = null;
    this.cargarBoletos();
  }

  cambiarPagina(delta: number): void {
    if (this.loadingBoletos || this.totalPaginas <= 1) {
      return;
    }

    const nuevaPagina = this.paginaActual + delta;
    if (nuevaPagina < 0 || nuevaPagina >= this.totalPaginas) {
      return;
    }

    this.paginaActual = nuevaPagina;
    this.cargarBoletos();
  }

  normalizarNumeroBusqueda(numero: string): string {
    const limpio = numero.trim();
    if (!limpio || !this.rifa) {
      return '';
    }

    return limpio.padStart(this.obtenerCifrasBoleto(), '0');
  }

  obtenerCifrasBoleto(): number {
    if (!this.rifa) {
      return 1;
    }

    return Math.max(String(this.rifa.cantidadBoletos - 1).length, 1);
  }

  actualizarResumenBoletos(cantidadMostrada: number = this.boletos.length, numeroBuscado?: string): void {
    if (numeroBuscado) {
      this.resumenBoletos = cantidadMostrada > 0
        ? `Se encontró el boleto ${numeroBuscado}`
        : `No se encontró el boleto ${numeroBuscado}`;
      return;
    }

    if (this.totalBoletos === 0) {
      this.resumenBoletos = 'No hay boletos para mostrar';
      return;
    }

    const inicio = this.paginaActual * this.tamanoPagina + 1;
    const fin = this.paginaActual * this.tamanoPagina + cantidadMostrada;
    this.resumenBoletos = `Mostrando ${inicio}-${fin} de ${this.totalBoletos} boletos`;
  }

  actualizarResumenGrupo(grupo: GrupoBoleto, numeroBuscado: string): void {
    const totalBoletosGrupo = grupo.boletos?.length ?? 0;
    this.resumenBoletos = totalBoletosGrupo > 0
      ? `Se encontró la agrupación ${grupo.nombre} al buscar ${numeroBuscado}`
      : `Se encontró la agrupación ${grupo.nombre}`;
  }

  saldoPendienteGrupo(grupo: GrupoBoleto): number {
    const valor = Number(grupo.valor || 0);
    const abonado = Number(grupo.montoAbonado || 0);
    return Math.max(valor - abonado, 0);
  }

  obtenerBoletoPrincipalGrupo(grupo: GrupoBoleto): Boleto | null {
    const boleto = grupo.boletos?.[0] ?? null;
    return boleto ? this.convertirBoletoGrupoABoleto(boleto, grupo) : null;
  }

  private convertirBoletoGrupoABoleto(boleto: GrupoBoletoItem, grupo: GrupoBoleto): Boleto {
    return {
      id: boleto.id,
      rifaId: boleto.rifaId,
      numero: boleto.numero,
      estadoVenta: boleto.estadoVenta as EstadoVenta,
      grupoId: boleto.grupoId ?? grupo.id,
      grupoNombre: grupo.nombre,
      grupoEstadoVenta: grupo.estadoVenta,
      grupoVendedorNombre: grupo.vendedorNombre ?? null,
      grupoMontoAbonado: grupo.montoAbonado ?? 0,
      grupoSaldoPendiente: this.saldoPendienteGrupo(grupo),
      vendedorId: boleto.vendedorId ?? grupo.vendedorId ?? null,
      vendedorNombre: boleto.vendedorNombre ?? grupo.vendedorNombre ?? null,
      compradorNombre: boleto.compradorNombre ?? grupo.compradorNombre ?? null,
      compradorTelefono: boleto.compradorTelefono ?? grupo.compradorTelefono ?? null,
      fechaVenta: boleto.fechaVenta ?? grupo.fechaVenta ?? null,
      montoAbonado: boleto.montoAbonado ?? grupo.montoAbonado ?? 0,
      descontarParteVendedor: boleto.descontarParteVendedor ?? false,
      montoNeto: boleto.montoNeto ?? null
    };
  }

  asignarPropietarioGrupo(grupo: GrupoBoleto): void {
    const boleto = this.obtenerBoletoPrincipalGrupo(grupo);
    if (boleto) {
      this.asignarPropietario(boleto);
    }
  }

  cambiarEstadoGrupo(grupo: GrupoBoleto, nuevoEstado: EstadoVenta): void {
    const boleto = this.obtenerBoletoPrincipalGrupo(grupo);
    if (boleto) {
      this.cambiarEstado(boleto, nuevoEstado);
    }
  }

  marcarVendidoGrupo(grupo: GrupoBoleto): void {
    const boleto = this.obtenerBoletoPrincipalGrupo(grupo);
    if (boleto) {
      this.marcarVendido(boleto);
    }
  }

  seguirAbonandoGrupo(grupo: GrupoBoleto): void {
    const boleto = this.obtenerBoletoPrincipalGrupo(grupo);
    if (boleto) {
      this.seguirAbonando(boleto);
    }
  }

  actualizarDescuentoGrupo(grupo: GrupoBoleto, descontarParteVendedor: boolean): void {
    const boleto = this.obtenerBoletoPrincipalGrupo(grupo);
    if (boleto) {
      this.actualizarDescuentoVendedor(boleto, descontarParteVendedor);
    }
  }

  trackByBoletoId(index: number, boleto: Boleto): number {
    return boleto.id;
  }

  cambiarEstado(boleto: Boleto, nuevoEstado: EstadoVenta): void {
    const rifaId = this.rifaId;
    if (!rifaId) return;
    this.abrirModal(boleto, nuevoEstado === 'ABONADO' ? 'ABONAR' : 'VENDER');
  }

  asignarPropietario(boleto: Boleto): void {
    this.abrirModal(boleto, 'PROPIETARIO');
  }

  marcarVendido(boleto: Boleto): void {
    this.abrirModal(boleto, 'VENDER');
  }

  seguirAbonando(boleto: Boleto): void {
    this.abrirModal(boleto, 'ABONAR');
  }

  actualizarDescuentoVendedor(boleto: Boleto, descontarParteVendedor: boolean): void {
    if (!this.rifaId || boleto.estadoVenta !== 'VENDIDO') {
      return;
    }

    if (descontarParteVendedor) {
      // Registrar un retiro (se puede registrar múltiples veces)
      this.boletoService.registrarRetiro(this.rifaId, boleto.id).subscribe({
        next: (boletoActualizado) => {
          this.success = `Retiro registrado para el boleto ${boletoActualizado.numero}`;
          setTimeout(() => (this.success = ''), 3000);
          this.cargarBoletos();
          this.cargarEstadisticas();
        },
        error: () => {
          this.error = 'Error al registrar el retiro';
        }
      });
      return;
    }

    // Si se desmarca, simplemente actualizamos el flag
    this.boletoService.actualizarBoleto(this.rifaId, boleto.id, {
      estadoVenta: boleto.estadoVenta,
      compradorNombre: boleto.compradorNombre || '',
      compradorTelefono: boleto.compradorTelefono || '',
      descontarParteVendedor
    }).subscribe({
      next: (boletoActualizado) => {
        this.success = `Se actualizó el descuento del boleto ${boletoActualizado.numero}`;
        setTimeout(() => (this.success = ''), 3000);
        this.cargarBoletos();
        this.cargarEstadisticas();
      },
      error: () => {
        this.error = 'Error al actualizar la parte del vendedor';
      }
    });
  }

  obtenerVendedorDelBoleto(boleto: Boleto): Vendedor | undefined {
    return this.vendedores.find((vendedor) => vendedor.id === boleto.vendedorId);
  }

  obtenerParteDelVendedor(boleto: Boleto): number {
    if (
      boleto.descontarParteVendedor &&
      boleto.estadoVenta === 'VENDIDO' &&
      boleto.montoNeto !== undefined &&
      boleto.montoNeto !== null
    ) {
      const montoAbonado = Number(boleto.montoAbonado || 0);
      return Math.max(montoAbonado - Number(boleto.montoNeto), 0);
    }

    const vendedor = this.obtenerVendedorDelBoleto(boleto);
    return vendedor?.parteDelDinero ?? 0;
  }

  obtenerMontoNeto(boleto: Boleto): number {
    if (boleto.montoNeto !== undefined && boleto.montoNeto !== null) {
      return boleto.montoNeto;
    }

    const montoAbonado = Number(boleto.montoAbonado || 0);
    if (!boleto.descontarParteVendedor || boleto.estadoVenta !== 'VENDIDO') {
      return montoAbonado;
    }

    return Math.max(montoAbonado - this.obtenerParteDelVendedor(boleto), 0);
  }

  abrirModal(boleto: Boleto, modo: 'VENDER' | 'ABONAR' | 'PROPIETARIO'): void {
    this.boletoModal = boleto;
    this.modalModo = modo;
    this.modalVendedorId = boleto.vendedorId ?? undefined;
    this.modalCompradorNombre = boleto.compradorNombre || '';
    this.modalCompradorTelefono = boleto.compradorTelefono || '';
    this.modalMonto = modo === 'ABONAR' ? undefined : undefined;
    this.modalError = '';
    this.sidebarService.closeSidebar();
    this.showBoletoModal = true;
  }

  cerrarModal(): void {
    this.showBoletoModal = false;
    this.boletoModal = undefined;
    this.modalError = '';
  }

  confirmarModal(): void {
    if (!this.boletoModal) {
      return;
    }

    const rifaId = this.rifaId;
    if (!rifaId) {
      return;
    }

    if (!this.modalVendedorId) {
      this.modalError = 'Selecciona un vendedor.';
      return;
    }

    if (this.modalModo !== 'PROPIETARIO' && (!this.modalCompradorNombre.trim() || !this.modalCompradorTelefono.trim())) {
      this.modalError = 'Ingresa el nombre y teléfono del comprador.';
      return;
    }

    if (this.modalModo === 'PROPIETARIO') {
      this.boletoService.asignarPropietario(rifaId, this.boletoModal.id, {
        vendedorId: this.modalVendedorId
      }).subscribe({
        next: (boletoActualizado) => {
          this.success = `Propietario asignado al boleto ${boletoActualizado.numero}`;
          setTimeout(() => (this.success = ''), 3000);
          this.cerrarModal();
          this.cargarBoletos();
          this.cargarEstadisticas();
        },
        error: () => {
          this.modalError = 'Error al asignar propietario';
        }
      });

      return;
    }

    if (this.modalModo === 'ABONAR') {
      const monto = Number(this.modalMonto);
      const maximo = this.montoMaximoAbono();

      if (!Number.isFinite(monto) || monto <= 0) {
        this.modalError = 'Ingresa un monto válido.';
        return;
      }

      if (monto > maximo) {
        this.modalError = `El monto máximo a abonar es ${maximo.toFixed(2)}.`;
        return;
      }

      this.boletoService.abonarBoleto(rifaId, this.boletoModal.id, {
        vendedorId: this.modalVendedorId,
        monto,
        compradorNombre: this.modalCompradorNombre.trim(),
        compradorTelefono: this.modalCompradorTelefono.trim()
      }).subscribe({
        next: (boletoActualizado) => {
          this.success = `Boleto ${boletoActualizado.numero} abonado correctamente`;
          setTimeout(() => (this.success = ''), 3000);
          this.cerrarModal();
          this.cargarBoletos();
          this.cargarEstadisticas();
        },
        error: () => {
          this.modalError = 'Error al registrar el abono';
        }
      });

      return;
    }

    this.boletoService.pagarBoleto(rifaId, this.boletoModal.id, {
      vendedorId: this.modalVendedorId,
      compradorNombre: this.modalCompradorNombre.trim(),
      compradorTelefono: this.modalCompradorTelefono.trim()
    }).subscribe({
      next: (boletoActualizado) => {
        this.success = `Boleto ${boletoActualizado.numero} marcado como vendido`;
        setTimeout(() => (this.success = ''), 3000);
        this.cerrarModal();
        this.cargarBoletos();
        this.cargarEstadisticas();
      },
      error: () => {
        this.modalError = 'Error al actualizar boleto';
      }
    });
  }

  montoMaximoAbono(): number {
    if (!this.boletoModal || !this.rifa?.valorBoleto) {
      return 0;
    }

    const abonado = Number(this.boletoModal.montoAbonado || 0);
    return Math.max(this.rifa.valorBoleto - abonado, 0);
  }

  obtenerColorPorEstado(estado: EstadoVenta | string): string {
    const estadoNormalizado = estado as EstadoVenta;

    switch (estadoNormalizado) {
      case 'DISPONIBLE':
        return '#27ae60'; // Verde
      case 'AGRUPADA':
        return '#3b82f6'; // Azul
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

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  getSaldoPendiente(boleto: Boleto): number {
    // Si el boleto pertenece a un grupo y trae saldo pendiente del grupo, usar ese valor
    if (boleto.grupoSaldoPendiente !== undefined && boleto.grupoSaldoPendiente !== null) {
      return Math.max(Number(boleto.grupoSaldoPendiente), 0);
    }

    // En caso contrario usar el valor de la rifa menos lo abonado en el boleto
    const valor = this.rifa?.valorBoleto || 0;
    const abonado = Number(boleto.montoAbonado || 0);
    return Math.max(Number(valor) - abonado, 0);
  }
}
