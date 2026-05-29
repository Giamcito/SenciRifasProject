import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Boleto } from '../../../../models/boleto';
import { Rifa } from '../../../../models/rifa';
import { BoletoService } from '../../../../services/boleto.service';
import { RifaService } from '../../../../services/rifa.service';
import { Vendedor, VendedorService } from '../../../../services/vendedor.service';

@Component({
  selector: 'app-venta-boletos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venta-boletos.component.html',
  styleUrls: ['./venta-boletos.component.css']
})
export class VentaBoletosComponent implements OnInit {
  rifaId!: number;
  rifas: Rifa[] = [];
  rifa: Rifa | null = null;
  cifras: number = 0;
  selectedBoleto?: Boleto;
  numeroBuscar: string = '';
  notFound: boolean = false;
  error: string = '';
  success: string = '';
  vendedores: Vendedor[] = [];
  vendedorSeleccionadoId?: number;
  montoAbono?: number;
  compradorNombre?: string;
  compradorTelefono?: string;
  valorBoleto: number = 0;

  constructor(
    private route: ActivatedRoute,
    private boletoService: BoletoService,
    private rifaService: RifaService,
    private vendedorService: VendedorService
  ) {}

  ngOnInit(): void {
    const paramRifa = this.route.snapshot.paramMap.get('id');
    if (paramRifa) this.rifaId = Number(paramRifa);

    const numeroParam = this.route.snapshot.queryParamMap.get('numero');
    if (numeroParam) {
      this.numeroBuscar = numeroParam;
    }

    this.loadRifas();
    this.loadVendedores();
  }

  loadBoletos() {
    // Ya no cargamos todos los boletos por defecto para evitar latencia.
    this.notFound = false;
  }

  loadRifa() {
    this.rifaService.obtenerRifa(this.rifaId).subscribe(r => {
      this.rifa = r;
      this.valorBoleto = (r && r.valorBoleto) || 0;
    });
  }

  loadVendedores() {
    this.vendedorService.obtenerVendedores().subscribe(v => this.vendedores = v);
  }

  loadRifas() {
    this.rifaService.obtenerRifas().subscribe(list => {
      this.rifas = list;
      if (!this.rifaId && this.rifas.length > 0) {
        // do not auto-select; wait for user unless route param provided
      }
      if (this.rifaId) {
        this.loadBoletos();
        this.loadRifa();
      }
    });
  }

  seleccionarRifa() {
    if (!this.rifaId) return;
    this.loadBoletos();
    this.loadRifa();
    this.selectedBoleto = undefined;
    this.numeroBuscar = '';
    this.notFound = false;
    const sel = this.rifas.find(r => r.id === this.rifaId);
    if (sel && sel.cantidadBoletos) {
      this.cifras = sel.cantidadBoletos <= 1 ? 1 : String(sel.cantidadBoletos - 1).length;
    } else {
      this.cifras = 0;
    }
  }

  buscar() {
    const target = (this.numeroBuscar || '').toString().trim();
    if (!target) {
      this.selectedBoleto = undefined;
      this.notFound = false;
      this.error = '';
      return;
    }

    const numero = this.cifras > 0 ? target.padStart(this.cifras, '0') : target;
    this.error = '';

    this.boletoService.obtenerBoletoPorNumero(this.rifaId, numero).subscribe({
      next: (boleto) => {
        this.cargarBoletoSeleccionado(boleto);
      },
      error: (err) => {
        this.selectedBoleto = undefined;
        this.notFound = true;
        this.error = err?.error || 'Boleto no encontrado para la rifa seleccionada.';
      }
    });
  }

  private cargarBoletoSeleccionado(boleto: Boleto) {
    this.selectedBoleto = boleto;
    this.notFound = false;
    this.error = '';
    this.success = '';
    this.vendedorSeleccionadoId = boleto.vendedorId ?? undefined;
    this.compradorNombre = boleto.compradorNombre ?? '';
    this.compradorTelefono = boleto.compradorTelefono ?? '';
    this.montoAbono = undefined;
    if (boleto.estadoVenta === 'VENDIDO' || boleto.estadoVenta === 'ABONADO') {
      this.success = `Se cargaron los datos de la boleta ${boleto.numero}.`;
    }
  }

  montoMaximoAbono(): number {
    if (!this.selectedBoleto || !this.valorBoleto) {
      return 0;
    }

    const abonado = Number(this.selectedBoleto.montoAbonado || 0);
    return Math.max(this.valorBoleto - abonado, 0);
  }

  abonar() {
    const monto = Number(this.montoAbono);
    const maximo = this.montoMaximoAbono();
    if (!this.selectedBoleto || !this.vendedorSeleccionadoId || !Number.isFinite(monto) || monto <= 0) {
      this.error = 'Selecciona un boleto, un vendedor y un monto válido.';
      return;
    }

    if (monto > maximo) {
      this.error = `El monto máximo a abonar es ${maximo.toFixed(2)}.`;
      return;
    }

    this.error = '';
    this.boletoService.abonarBoleto(this.rifaId, this.selectedBoleto.id, {
      vendedorId: this.vendedorSeleccionadoId,
      monto,
      compradorNombre: this.compradorNombre,
      compradorTelefono: this.compradorTelefono
    }).subscribe({
      next: (b) => {
        this.cargarBoletoSeleccionado(b);
        this.success = `Abono registrado para el boleto ${b.numero}.`;
        this.loadBoletos();
      },
      error: (err) => {
        this.error = err?.error || 'No se pudo registrar el abono.';
      }
    });
  }

  asignarPropietario() {
    if (!this.selectedBoleto || !this.vendedorSeleccionadoId) {
      this.error = 'Selecciona un boleto y un vendedor.';
      return;
    }

    this.error = '';
    this.boletoService.asignarPropietario(this.rifaId, this.selectedBoleto.id, {
      vendedorId: this.vendedorSeleccionadoId
    }).subscribe({
      next: (b) => {
        this.cargarBoletoSeleccionado(b);
        this.success = `Propietario asignado al boleto ${b.numero}.`;
        this.loadBoletos();
      },
      error: (err) => {
        this.error = err?.error || 'No se pudo asignar el propietario.';
      }
    });
  }

  pagar() {
    if (!this.selectedBoleto || !this.vendedorSeleccionadoId) {
      this.error = 'Selecciona un boleto y un vendedor.';
      return;
    }

    this.error = '';
    this.boletoService.pagarBoleto(this.rifaId, this.selectedBoleto.id, {
      vendedorId: this.vendedorSeleccionadoId,
      compradorNombre: this.compradorNombre,
      compradorTelefono: this.compradorTelefono
    }).subscribe({
      next: (b) => {
        this.cargarBoletoSeleccionado(b);
        this.success = `Pago completo registrado para el boleto ${b.numero}.`;
        this.loadBoletos();
      },
      error: (err) => {
        this.error = err?.error || 'No se pudo registrar el pago completo.';
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
