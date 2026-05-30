import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Rifa } from '../../../../models/rifa';
import { AuthService } from '../../../../services/auth.service';
import { RifaService } from '../../../../services/rifa.service';

@Component({
  selector: 'app-rifas-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rifas-preview.component.html',
  styleUrl: './rifas-preview.component.css'
})
export class RifasPreviewComponent implements OnInit {
  user: any;
  rifas: Rifa[] = [];
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private rifaService: RifaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.cargarRifas();
      }
    });
  }

  cargarRifas(): void {
    this.loading = true;
    this.error = '';

    this.rifaService.obtenerRifas().subscribe({
      next: (rifas) => {
        this.rifas = [...rifas].sort((a, b) => {
          const fechaA = new Date(a.createdAt).getTime();
          const fechaB = new Date(b.createdAt).getTime();
          return fechaB - fechaA;
        });
        this.loading = false;
      },
      error: () => {
        this.rifas = [];
        this.loading = false;
        this.error = 'No fue posible cargar las rifas';
      }
    });
  }

  trackByRifaId(index: number, rifa: Rifa): number {
    return rifa.id;
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(valor);
  }

  irAAdministrar(rifa: Rifa): void {
    this.router.navigate(['/dashboard/administrar-rifas/visualizar-rifas', rifa.id]);
  }

  irAVender(rifa: Rifa): void {
    this.router.navigate(['/dashboard/venta-boletos', rifa.id]);
  }

  irAConsultar(rifa: Rifa): void {
    this.router.navigate(['/dashboard/consultar-datos'], { queryParams: { rifaId: rifa.id } });
  }
}
