import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Boleto, GrupoBoleto } from '../../../../models/grupo';
import { Rifa } from '../../../../models/rifa';
import { GrupoService } from '../../../../services/grupo.service';
import { RifaService } from '../../../../services/rifa.service';
import { Vendedor, VendedorService } from '../../../../services/vendedor.service';

@Component({
  selector: 'app-agrupar-boletos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './agrupar-boletos.component.html',
  styleUrl: './agrupar-boletos.component.css'
})
export class AgruparBoletosComponent implements OnInit {
  rifasDisponibles: Rifa[] = [];
  rifaKey: string = '';
  rifaId: number = 0;
  rifa: Rifa | null = null;
  vendedores: Vendedor[] = [];
  grupos: GrupoBoleto[] = [];
  gruposPage = 0;
  gruposPageSize = 5;
  gruposSearchTerm: string = '';
  boletosDisponibles: Boleto[] = [];
  boletosPage = 0;
  boletosPageSize = 100;
  totalBoletosDisponibles = 0;
  totalPaginasBoletos = 0;
  ultimaPaginaBoletos = false;
  prefillIntentado = false;
  prefillAplicado = false;
  mostrarModalEliminarGrupo = false;
  grupoIdPendienteEliminar: number | null = null;
  
  searchTerm: string = '';
  agrupacionForm: FormGroup;
  vendedorSeleccionadoId: number | null = null;
  boletosSeleccionados: number[] = [];
  
  loading: boolean = false;
  error: string = '';
  successMessage: string = '';
  token: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private grupoService: GrupoService,
    private rifaService: RifaService,
    private vendedorService: VendedorService,
    private fb: FormBuilder
  ) {
    this.agrupacionForm = this.fb.group({
      vendedorId: ['']
    });
  }

  ngOnInit(): void {
    this.token = localStorage.getItem('token') || '';
    this.rifaKey = this.route.snapshot.paramMap.get('rifaKey') || '';

    if (this.rifaKey && this.token) {
      this.cargarDatos();
    } else {
      this.cargarRifasDisponibles();
    }
  }

  cargarRifasDisponibles(): void {
    this.loading = true;
    this.rifaService.obtenerRifas().subscribe({
      next: (rifas) => {
        this.rifasDisponibles = [...rifas].sort((a, b) => {
          const fechaA = new Date(a.createdAt).getTime();
          const fechaB = new Date(b.createdAt).getTime();
          return fechaB - fechaA;
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar las rifas disponibles';
        this.loading = false;
      }
    });
  }

  seleccionarRifa(rifa: Rifa): void {
    this.router.navigate(['/dashboard/agrupar-boletos', rifa.uniqueId ?? rifa.id]);
  }

  cargarDatos(): void {
    this.loading = true;
    
    const rifaIdFallback = Number(this.rifaKey);
    const cargarPorId = () => this.rifaService.obtenerRifa(rifaIdFallback);
    const cargaPrincipal = this.rifaKey && isNaN(Number(this.rifaKey))
      ? this.rifaService.obtenerRifaPorUniqueId(this.rifaKey)
      : cargarPorId();

    // Cargar rifa
    cargaPrincipal.subscribe({
      next: (rifa) => {
        this.rifa = rifa;
        this.rifaId = rifa.id;
        this.cargarVendedores();
        
        // Cargar grupos
        this.grupoService.obtenerGrupos(this.rifaId, this.token).subscribe({
          next: (grupos) => {
            this.grupos = grupos;
            
            // Cargar boletos disponibles
            this.cargarBoletosDisponibles();
          },
          error: () => {
            this.error = 'Error al cargar los grupos';
            this.loading = false;
          }
        });
      },
      error: () => {
        if (this.rifaKey && !isNaN(Number(this.rifaKey))) {
          cargarPorId().subscribe({
            next: (rifa) => {
              this.rifa = rifa;
              this.rifaId = rifa.id;
              this.cargarVendedores();

              this.grupoService.obtenerGrupos(this.rifaId, this.token).subscribe({
                next: (grupos) => {
                  this.grupos = grupos;
                  this.gruposPage = 0;
                  this.cargarBoletosDisponibles();
                },
                error: () => {
                  this.error = 'Error al cargar los grupos';
                  this.loading = false;
                }
              });
            },
            error: () => {
              this.error = 'Error al cargar la rifa';
              this.loading = false;
            }
          });
          return;
        }

        this.error = 'Error al cargar la rifa';
        this.loading = false;
      }
    });
  }

  cargarVendedores(): void {
    this.vendedorService.obtenerVendedores().subscribe({
      next: (vendedores) => {
        this.vendedores = vendedores;
      },
      error: () => {
        this.error = 'Error al cargar los vendedores';
      }
    });
  }

  cargarBoletosDisponibles(): void {
    this.boletosPage = 0;
    this.ultimaPaginaBoletos = false;
    this.cargarBoletosDisponiblesPage(true);
  }

  cargarMasBoletos(): void {
    if (this.ultimaPaginaBoletos || this.loading) {
      return;
    }

    this.boletosPage += 1;
    this.cargarBoletosDisponiblesPage(false);
  }

  private cargarBoletosDisponiblesPage(reiniciarLista: boolean): void {
    this.loading = true;

    this.grupoService.obtenerBoletosDisponibles(
      this.rifaId,
      this.searchTerm?.trim() || undefined,
      this.token,
      this.boletosPage,
      this.boletosPageSize
    ).subscribe({
      next: (boletos) => {
        this.totalBoletosDisponibles = boletos.totalElements;
        this.totalPaginasBoletos = boletos.totalPages;
        this.ultimaPaginaBoletos = boletos.last;
        this.boletosDisponibles = reiniciarLista ? [...boletos.content] : [...this.boletosDisponibles, ...boletos.content];
        this.loading = false;
        // Aplicar preselección si venimos con query param `numero`
        this.applyPrefillFromQuery();
      },
      error: () => {
        this.error = 'Error al cargar los boletos disponibles';
        this.loading = false;
      }
    });
  }

  private applyPrefillFromQuery(): void {
    const preNumero = this.route.snapshot.queryParamMap.get('numero');
    if (!preNumero || this.prefillAplicado || !this.boletosDisponibles || this.boletosDisponibles.length === 0) return;

    if (!this.prefillIntentado) {
      this.prefillIntentado = true;
      this.searchTerm = preNumero;
      this.buscarBoletos();
      return;
    }

    // Normalizar y buscar el índice del boleto de inicio
    const startIndex = this.boletosDisponibles.findIndex(b => b.numero === preNumero || b.numero === String(Number(preNumero)));
    if (startIndex === -1) return;

    const groupSize = Number(this.rifa?.cantidadAgrupacion ?? 1);
    this.boletosSeleccionados = [];

    for (let i = startIndex; i < Math.min(startIndex + groupSize, this.boletosDisponibles.length); i++) {
      const boleto = this.boletosDisponibles[i];
      if (boleto && !this.isBoletoSeleccionado(boleto.id)) {
        this.boletosSeleccionados.push(boleto.id);
      }
    }

    // Filtrar lista para mostrar la ventana de boletos alrededor del número
    this.searchTerm = preNumero;
    this.prefillAplicado = true;
  }

  toggleBoletoSeleccionado(boletoId: number): void {
    const index = this.boletosSeleccionados.indexOf(boletoId);
    if (index > -1) {
      this.boletosSeleccionados.splice(index, 1);
    } else {
      this.boletosSeleccionados.push(boletoId);
    }
  }

  agregarAgrupacion(): void {
    const vendedorId = this.agrupacionForm.value.vendedorId ? Number(this.agrupacionForm.value.vendedorId) : null;

    if (!vendedorId) {
      this.error = 'Selecciona un vendedor';
      return;
    }

    if (this.boletosSeleccionados.length === 0) {
      this.error = 'Selecciona al menos un boleto';
      return;
    }

    this.loading = true;
    this.error = '';

    this.grupoService.crearAgrupacion(
      this.rifaId,
      vendedorId,
      this.boletosSeleccionados,
      this.token
    ).subscribe({
      next: (grupoActualizado) => {
        const cantidadAgregada = this.boletosSeleccionados.length;
        this.grupos = [grupoActualizado, ...this.grupos];
        this.gruposPage = 0;
        this.cargarBoletosDisponibles();
        this.boletosSeleccionados = [];
        this.agrupacionForm.reset();

        this.successMessage = `${cantidadAgregada} boletos agrupados exitosamente`;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || err?.error || 'Error al agregar boletos al grupo';
        this.loading = false;
      }
    });
  }

  removerBoletoDelGrupo(grupoId: number, boletoId: number): void {
    this.loading = true;

    this.grupoService.removerBoletosDelGrupo(
      this.rifaId,
      grupoId,
      [boletoId],
      this.token
    ).subscribe({
      next: (grupoActualizado) => {
        // Actualizar el grupo en la lista
        const index = this.grupos.findIndex(g => g.id === grupoActualizado.id);
        if (index > -1) {
          this.grupos[index] = grupoActualizado;
        }

        // Recargar boletos disponibles
        this.cargarBoletosDisponibles();

        this.successMessage = 'Boleto removido del grupo';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);

        this.loading = false;
      },
      error: () => {
        this.error = 'Error al remover boleto del grupo';
        this.loading = false;
      }
    });
  }

  eliminarGrupo(grupoId: number): void {
    this.grupoIdPendienteEliminar = grupoId;
    this.mostrarModalEliminarGrupo = true;
  }

  cerrarModalEliminarGrupo(): void {
    this.mostrarModalEliminarGrupo = false;
    this.grupoIdPendienteEliminar = null;
  }

  confirmarEliminarGrupo(): void {
    if (this.grupoIdPendienteEliminar == null) {
      this.cerrarModalEliminarGrupo();
      return;
    }

    this.loading = true;
    const grupoId = this.grupoIdPendienteEliminar;
    this.cerrarModalEliminarGrupo();

    this.grupoService.eliminarGrupo(this.rifaId, grupoId, this.token).subscribe({
      next: () => {
        this.grupos = this.grupos.filter(g => g.id !== grupoId);
        this.ajustarPaginaGrupos();
        this.cargarBoletosDisponibles();

        this.successMessage = 'Grupo eliminado';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);

        this.loading = false;
      },
      error: () => {
        this.error = 'Error al eliminar el grupo';
        this.loading = false;
      }
    });
  }

  onModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrarModalEliminarGrupo();
    }
  }

  buscarBoletos(): void {
    this.boletosPage = 0;
    this.ultimaPaginaBoletos = false;
    this.prefillAplicado = false;
    this.cargarBoletosDisponiblesPage(true);
  }

  selectTodosBoletos(): void {
    this.boletosSeleccionados = this.boletosDisponibles.map(b => b.id);
  }

  deselectTodosBoletos(): void {
    this.boletosSeleccionados = [];
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  continuarAVenta(): void {
    this.router.navigate(['/dashboard/venta-boletos', this.rifaId]);
  }

  get gruposFiltrados(): GrupoBoleto[] {
    const term = this.gruposSearchTerm.trim().toLowerCase();

    if (!term) {
      return this.grupos;
    }

    return this.grupos.filter((grupo) =>
      (grupo.boletos ?? []).some((boleto) => boleto.numero.toLowerCase().includes(term))
    );
  }

  get totalPaginasGrupos(): number {
    return Math.max(1, Math.ceil(this.gruposFiltrados.length / this.gruposPageSize));
  }

  get gruposMostrados(): GrupoBoleto[] {
    const startIndex = this.gruposPage * this.gruposPageSize;
    return this.gruposFiltrados.slice(startIndex, startIndex + this.gruposPageSize);
  }

  get paginaActualGrupos(): number {
    return this.gruposFiltrados.length === 0 ? 0 : this.gruposPage + 1;
  }

  get haySiguientePaginaGrupos(): boolean {
    return this.gruposPage < this.totalPaginasGrupos - 1;
  }

  get hayBusquedaGrupos(): boolean {
    return this.gruposSearchTerm.trim().length > 0;
  }

  paginaAnteriorGrupos(): void {
    if (this.gruposPage > 0) {
      this.gruposPage -= 1;
    }
  }

  paginaSiguienteGrupos(): void {
    if (this.haySiguientePaginaGrupos) {
      this.gruposPage += 1;
    }
  }

  limpiarBusquedaGrupos(): void {
    this.gruposSearchTerm = '';
    this.gruposPage = 0;
  }

  onBusquedaGruposChange(): void {
    this.gruposPage = 0;
  }

  private ajustarPaginaGrupos(): void {
    const maxPage = Math.max(0, Math.ceil(this.gruposFiltrados.length / this.gruposPageSize) - 1);
    this.gruposPage = Math.min(this.gruposPage, maxPage);
  }

  isBoletoSeleccionado(boletoId: number): boolean {
    return this.boletosSeleccionados.includes(boletoId);
  }
}
