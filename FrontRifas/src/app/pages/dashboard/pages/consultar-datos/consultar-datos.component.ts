import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Rifa } from '../../../../models/rifa';
import { RifaService } from '../../../../services/rifa.service';

@Component({
  selector: 'app-consultar-datos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultar-datos.component.html',
  styleUrl: './consultar-datos.component.css'
})
export class ConsultarDatosComponent implements OnInit {
  rifaId: number | null = null;
  rifa: Rifa | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rifaService: RifaService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const value = params.get('rifaId');
      this.rifaId = value ? Number(value) : null;

      if (this.rifaId) {
        this.cargarRifa();
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
      },
      error: () => {
        this.rifa = null;
        this.loading = false;
        this.error = 'No se pudo cargar la rifa seleccionada';
      }
    });
  }

  volverAdministracion(): void {
    this.router.navigate(['/dashboard/administrar-rifas']);
  }
}
