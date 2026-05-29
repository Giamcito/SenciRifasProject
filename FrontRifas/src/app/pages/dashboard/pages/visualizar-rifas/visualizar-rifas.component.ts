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
  error: string = '';
  success: string = '';
  
  filtroEstado: EstadoVenta | 'TODOS' = 'TODOS';
  busquedaNumero: string = '';
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
