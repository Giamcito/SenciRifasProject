import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Rifa } from '../../../../models/rifa';
import { BoletoService } from '../../../../services/boleto.service';
import { RifaService } from '../../../../services/rifa.service';
import { SidebarService } from '../../../../services/sidebar.service';

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
  modalVisible: boolean = false;
  modalLoading: boolean = false;
  modalTipo: 'confirmacion' | 'exito' | 'error' = 'confirmacion';
  modalTitulo: string = '';
  modalMensaje: string = '';
  modalRifaId: number | null = null;
  modalRifa: Rifa | null = null;
  modalAccion: 'generar' | 'eliminar' | 'activarAgrupacion' | 'desactivarAgrupacion' | null = null;
  modalCantidadAgrupacion: number | null = null;

  constructor(
    private rifaService: RifaService,
    private boletoService: BoletoService,
    private router: Router,
    private route: ActivatedRoute
    ,
    private sidebarService: SidebarService
  ) {}

  generarBoletos(rifaId: number) {
    const rifa = this.rifas.find((item) => item.id === rifaId) || null;
    this.modalRifaId = rifaId;
    this.modalRifa = rifa;
    this.modalAccion = 'generar';
    this.modalTipo = 'confirmacion';
    this.modalTitulo = 'Generar boletos';
    this.modalMensaje = this.obtenerMensajeGeneracion(rifa);
    this.modalLoading = false;
    this.sidebarService.closeSidebar();
    this.modalVisible = true;
  }

  eliminarRifa(id: number): void {
    const rifa = this.rifas.find((item) => item.id === id) || null;
    this.modalRifaId = id;
    this.modalRifa = rifa;
    this.modalAccion = 'eliminar';
    this.modalTipo = 'confirmacion';
    this.modalTitulo = 'Eliminar rifa';
    this.modalMensaje = `¿Estás seguro de que deseas eliminar ${rifa?.nombre ?? 'esta rifa'}? Esta acción no se puede deshacer.`;
    this.modalLoading = false;
    this.sidebarService.closeSidebar();
    this.modalVisible = true;
  }

  confirmarGeneracionBoletos(): void {
    if (!this.modalRifaId) {
      return;
    }

    const rifaId = this.modalRifaId;
    this.modalLoading = true;

    this.boletoService.generarBoletos(rifaId).subscribe({
      next: () => {
        this.modalLoading = false;
        this.modalTipo = 'exito';
        this.modalTitulo = 'Boletos generados';
        this.modalMensaje = 'Los boletos se generaron correctamente.';
      },
      error: (err) => {
        this.modalLoading = false;
        this.modalTipo = 'error';
        this.modalTitulo = 'No se pudieron generar';
        this.modalMensaje = err?.status === 409
          ? 'Esta rifa ya tiene boletos generados y no se pueden volver a generar.'
          : 'Error generando boletos';
      }
    });
  }

  confirmarEliminacionRifa(): void {
    if (!this.modalRifaId) {
      return;
    }

    const rifaId = this.modalRifaId;
    this.modalLoading = true;

    this.rifaService.eliminarRifa(rifaId).subscribe({
      next: () => {
        this.modalLoading = false;
        this.modalTipo = 'exito';
        this.modalTitulo = 'Rifa eliminada';
        this.modalMensaje = 'La rifa se eliminó correctamente.';
        this.rifas = this.rifas.filter((r) => r.id !== rifaId);
      },
      error: () => {
        this.modalLoading = false;
        this.modalTipo = 'error';
        this.modalTitulo = 'No se pudo eliminar';
        this.modalMensaje = 'Error al eliminar la rifa';
      }
    });
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.modalLoading = false;
    this.modalTipo = 'confirmacion';
    this.modalTitulo = '';
    this.modalMensaje = '';
    this.modalRifaId = null;
    this.modalRifa = null;
    this.modalAccion = null;
    this.modalCantidadAgrupacion = null;
  }

  continuarDespuesDelModal(): void {
    const rifaId = this.modalRifaId;
    const rifa = this.modalRifa;
    const accion = this.modalAccion;

    if (!rifaId) {
      this.cerrarModal();
      return;
    }

    this.cerrarModal();

    // Do not navigate after activate/deactivate grouping or deletion; only keep navigation for other flows
    if (accion === 'eliminar' || accion === 'activarAgrupacion' || accion === 'desactivarAgrupacion') {
      return;
    }

    if (rifa?.gruposHabilitado) {
      this.router.navigate(['/dashboard/agrupar-boletos', rifa?.uniqueId ?? rifaId]);
    } else {
      this.router.navigate(['/dashboard/administrar-rifas/visualizar-rifas', rifa?.uniqueId ?? rifaId]);
    }
  }

  activarAgrupacion(rifa: Rifa): void {
    this.modalRifaId = rifa.id;
    this.modalRifa = rifa;
    this.modalAccion = 'activarAgrupacion';
    this.modalTipo = 'confirmacion';
    this.modalTitulo = 'Activar agrupación';
    this.modalMensaje = `Ingresa la cantidad de boletas por agrupación para "${rifa.nombre}"`;
    this.modalCantidadAgrupacion = null;
    this.modalLoading = false;
    this.sidebarService.closeSidebar();
    this.modalVisible = true;
  }

  desactivarAgrupacion(rifa: Rifa): void {
    this.modalRifaId = rifa.id;
    this.modalRifa = rifa;
    this.modalAccion = 'desactivarAgrupacion';
    this.modalTipo = 'confirmacion';
    this.modalTitulo = 'Desactivar agrupación';
    this.modalMensaje = `¿Deseas desactivar la agrupación para "${rifa.nombre}"? Las agrupaciones existentes no se eliminarán automáticamente.`;
    this.modalLoading = false;
    this.sidebarService.closeSidebar();
    this.modalVisible = true;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('rifaKey');
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

    const gruposHabilitado = !!this.editingData.gruposHabilitado;
    const cantidadAgrupacion: number | undefined = gruposHabilitado
      ? parseInt(this.editingData.cantidadAgrupacion, 10)
      : undefined;

    this.rifaService.actualizarRifa(this.editingId, {
      nombre: this.editingData.nombre,
      cantidadBoletos: parseInt(this.editingData.cantidadBoletos, 10),
      valorBoleto: parseFloat(this.editingData.valorBoleto),
      gruposHabilitado,
      cantidadAgrupacion
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

  verRifa(rifaId: number): void {
    const rifa = this.rifas.find((item) => item.id === rifaId);
    this.router.navigate(['/dashboard/administrar-rifas/visualizar-rifas', rifa?.uniqueId ?? rifaId]);
  }

  esRifaSeleccionada(rifaId: number): boolean {
    return this.selectedRifaId === rifaId;
  }

  obtenerCantidadCifras(cantidad: number): number {
    return cantidad.toString().length;
  }

  esRifaAgrupada(rifa: Rifa): boolean {
    return !!rifa.gruposHabilitado;
  }

  obtenerDetalleAgrupacion(rifa: Rifa): string {
    if (!rifa.gruposHabilitado || !rifa.cantidadAgrupacion) {
      return 'Sin agrupación';
    }

    return `${rifa.cantidadAgrupacion} boletas por agrupación`;
  }

  obtenerValorAgrupacion(rifa: Rifa): number {
    if (rifa.gruposHabilitado && Number(rifa.cantidadAgrupacion) > 0) {
      const totalPotencial = Number(rifa.cantidadBoletos || 0) * Number(rifa.valorBoleto || 0);
      return totalPotencial / Number(rifa.cantidadAgrupacion);
    }

    if (rifa.gruposHabilitado && typeof rifa.valorGrupo === 'number') {
      return rifa.valorGrupo;
    }

    return rifa.cantidadBoletos * rifa.valorBoleto;
  }

  private obtenerMensajeGeneracion(rifa: Rifa | null): string {
    const nombre = rifa?.nombre ?? 'esta rifa';
    if (rifa?.gruposHabilitado) {
      return `Vas a generar todos los boletos de ${nombre}. Esta rifa fue creada con agrupaciones: ${this.obtenerDetalleAgrupacion(rifa)}. Luego podrás ir a agruparlas.`;
    }

    return `Vas a generar todos los boletos de ${nombre}. Esta acción puede tardar.`;
  }

  accionModalPrincipal(): void {
    if (this.modalAccion === 'eliminar') {
      this.confirmarEliminacionRifa();
      return;
    }

    if (this.modalAccion === 'activarAgrupacion') {
      this.confirmarActivacionAgrupacion();
      return;
    }

    if (this.modalAccion === 'desactivarAgrupacion') {
      this.confirmarDesactivacionAgrupacion();
      return;
    }

    this.confirmarGeneracionBoletos();
  }

  private confirmarActivacionAgrupacion(): void {
    if (!this.modalRifaId) return;
    const cantidad = Number(this.modalCantidadAgrupacion);
    if (!cantidad || cantidad <= 0) {
      this.modalTipo = 'error';
      this.modalTitulo = 'Cantidad inválida';
      this.modalMensaje = 'La cantidad de agrupación debe ser un número entero mayor a 0.';
      return;
    }

    this.modalLoading = true;
    const rifaActual = this.modalRifa as Rifa;
    const payload = {
      nombre: rifaActual?.nombre ?? '',
      cantidadBoletos: Number(rifaActual?.cantidadBoletos ?? 0),
      valorBoleto: Number(rifaActual?.valorBoleto ?? 0),
      gruposHabilitado: true,
      cantidadAgrupacion: cantidad
    } as any;

    this.rifaService.actualizarRifa(this.modalRifaId, payload).subscribe({
      next: (rifaActualizada) => {
        this.modalLoading = false;
        this.modalTipo = 'exito';
        this.modalTitulo = 'Agrupación activada';
        this.modalMensaje = 'La agrupación se activó correctamente.';
        const index = this.rifas.findIndex(r => r.id === this.modalRifaId);
        if (index > -1) this.rifas[index] = rifaActualizada;
      },
      error: () => {
        this.modalLoading = false;
        this.modalTipo = 'error';
        this.modalTitulo = 'No se pudo activar';
        this.modalMensaje = 'Error al activar la agrupación';
      }
    });
  }

  private confirmarDesactivacionAgrupacion(): void {
    if (!this.modalRifaId) return;
    this.modalLoading = true;
    const rifaActual = this.modalRifa as Rifa;
    const payload = {
      nombre: rifaActual?.nombre ?? '',
      cantidadBoletos: Number(rifaActual?.cantidadBoletos ?? 0),
      valorBoleto: Number(rifaActual?.valorBoleto ?? 0),
      gruposHabilitado: false,
      cantidadAgrupacion: undefined
    } as any;

    this.rifaService.actualizarRifa(this.modalRifaId, payload).subscribe({
      next: (rifaActualizada) => {
        this.modalLoading = false;
        this.modalTipo = 'exito';
        this.modalTitulo = 'Agrupación desactivada';
        this.modalMensaje = 'La agrupación se desactivó correctamente.';
        const index = this.rifas.findIndex(r => r.id === this.modalRifaId);
        if (index > -1) this.rifas[index] = rifaActualizada;
      },
      error: () => {
        this.modalLoading = false;
        this.modalTipo = 'error';
        this.modalTitulo = 'No se pudo desactivar';
        this.modalMensaje = 'Error al desactivar la agrupación';
      }
    });
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(valor);
  }
}
