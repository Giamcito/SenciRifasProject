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
  rifaId: number = 0;
  rifa: Rifa | null = null;
  vendedores: Vendedor[] = [];
  grupos: GrupoBoleto[] = [];
  boletosDisponibles: Boleto[] = [];
  boletosDisponiblesOriginal: Boleto[] = [];
  
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
    const rifaParam = this.route.snapshot.paramMap.get('rifaId');
    this.rifaId = rifaParam ? parseInt(rifaParam, 10) : 0;

    if (this.rifaId && this.token) {
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
    this.router.navigate(['/dashboard/agrupar-boletos', rifa.id]);
  }

  cargarDatos(): void {
    this.loading = true;
    
    // Cargar rifa
    this.rifaService.obtenerRifa(this.rifaId).subscribe({
      next: (rifa) => {
        this.rifa = rifa;
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
    this.grupoService.obtenerBoletosDisponibles(this.rifaId, undefined, this.token).subscribe({
      next: (boletos) => {
        this.boletosDisponiblesOriginal = boletos;
        this.boletosDisponibles = [...boletos];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar los boletos disponibles';
        this.loading = false;
      }
    });
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
    if (!confirm('¿Estás seguro de que deseas eliminar este grupo?')) {
      return;
    }

    this.loading = true;

    this.grupoService.eliminarGrupo(this.rifaId, grupoId, this.token).subscribe({
      next: () => {
        this.grupos = this.grupos.filter(g => g.id !== grupoId);

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

  buscarBoletos(): void {
    if (!this.searchTerm) {
      this.boletosDisponibles = [...this.boletosDisponiblesOriginal];
    } else {
      const termLower = this.searchTerm.toLowerCase();
      this.boletosDisponibles = this.boletosDisponiblesOriginal.filter(b =>
        b.numero.toLowerCase().includes(termLower)
      );
    }
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

  isBoletoSeleccionado(boletoId: number): boolean {
    return this.boletosSeleccionados.includes(boletoId);
  }
}
