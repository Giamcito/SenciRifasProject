import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Boleto, Estadisticas, EstadoVenta } from '../../../../models/boleto';
import { Rifa } from '../../../../models/rifa';
import { BoletoService } from '../../../../services/boleto.service';
import { RifaService } from '../../../../services/rifa.service';
import { Vendedor, VendedorService } from '../../../../services/vendedor.service';

@Component({
  selector: 'app-visualizar-rifas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizar-rifas.component.html',
  styleUrls: ['./visualizar-rifas.component.css']
})
export class VisualizarRifasComponent implements OnInit {
  rifaId: number = 0;
  rifa: Rifa | null = null;
  boletos: Boleto[] = [];
  estadisticas: Estadisticas | null = null;
  loading: boolean = false;
  loadingBoletos: boolean = false;
  error: string = '';
  success: string = '';
  
  filtroEstado: EstadoVenta | 'TODOS' = 'TODOS';
  busquedaNumero: string = '';
  paginaActual: number = 0;
  tamanoPagina: number = 500;
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
    private rifaService: RifaService,
    private vendedorService: VendedorService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.rifaId = Number(params['id']);
      if (this.rifaId) {
        this.paginaActual = 0;
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
        this.loading = false;
        this.cargarBoletos();
        this.cargarEstadisticas();
        this.cargarVendedores();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Error al cargar la rifa';
      }
    });
  }

  cargarBoletos(): void {
    if (!this.rifaId) return;

    const numeroBuscado = this.normalizarNumeroBusqueda(this.busquedaNumero);

    if (numeroBuscado) {
      this.cargarBoletoPorNumero(numeroBuscado);
      return;
    }

    this.loadingBoletos = true;
    this.error = '';

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

  cargarBoletoPorNumero(numero: string): void {
    if (!this.rifaId) return;

    this.loadingBoletos = true;
    this.error = '';

    this.boletoService.obtenerBoletoPorNumero(this.rifaId, numero).subscribe({
      next: (boleto) => {
        const coincideFiltro = this.filtroEstado === 'TODOS' || boleto.estadoVenta === this.filtroEstado;
        this.boletos = coincideFiltro ? [boleto] : [];
        this.totalBoletos = coincideFiltro ? 1 : 0;
        this.totalPaginas = 1;
        this.loadingBoletos = false;
        this.actualizarResumenBoletos(coincideFiltro ? 1 : 0, numero);
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

  abrirModal(boleto: Boleto, modo: 'VENDER' | 'ABONAR' | 'PROPIETARIO'): void {
    this.boletoModal = boleto;
    this.modalModo = modo;
    this.modalVendedorId = boleto.vendedorId ?? undefined;
    this.modalCompradorNombre = boleto.compradorNombre || '';
    this.modalCompradorTelefono = boleto.compradorTelefono || '';
    this.modalMonto = modo === 'ABONAR' ? undefined : undefined;
    this.modalError = '';
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
