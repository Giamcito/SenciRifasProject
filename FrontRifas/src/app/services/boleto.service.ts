import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Boleto, Estadisticas } from '../models/boleto';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BoletoService {
  private apiUrl = 'http://localhost:8080/api/rifas';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtener todos los boletos de una rifa
   */
  obtenerBoletos(rifaId: number): Observable<Boleto[]> {
    return this.http.get<Boleto[]>(
      `${this.apiUrl}/${rifaId}/boletos`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener boletos sin token (endpoint público temporal)
   */
  obtenerBoletosPublico(rifaId: number): Observable<Boleto[]> {
    return this.http.get<Boleto[]>(`${this.apiUrl}/public/${rifaId}/boletos`);
  }

  /**
   * Obtener un boleto por número con autenticación
   */
  obtenerBoletoPorNumero(rifaId: number, numero: string): Observable<Boleto> {
    return this.http.get<Boleto>(`${this.apiUrl}/${rifaId}/boletos/numero/${encodeURIComponent(numero)}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener estadísticas de una rifa
   */
  obtenerEstadisticas(rifaId: number): Observable<Estadisticas> {
    return this.http.get<Estadisticas>(
      `${this.apiUrl}/${rifaId}/estadisticas`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Generar boletos para una rifa
   */
  generarBoletos(rifaId: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${rifaId}/generar-boletos`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualizar estado de un boleto
   */
  actualizarBoleto(rifaId: number, boletoId: number, datos: { estadoVenta: string; vendedorId?: number; vendedorNombre?: string; compradorNombre?: string; compradorTelefono?: string }): Observable<Boleto> {
    return this.http.put<Boleto>(
      `${this.apiUrl}/${rifaId}/boletos/${boletoId}`,
      datos,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Abonar parcial a un boleto
   */
  abonarBoleto(rifaId: number, boletoId: number, datos: { vendedorId?: number; vendedorNombre?: string; monto: number; compradorNombre?: string; compradorTelefono?: string }): Observable<Boleto> {
    return this.http.post<Boleto>(
      `${this.apiUrl}/${rifaId}/boletos/${boletoId}/abono`,
      datos,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Pagar completo un boleto
   */
  pagarBoleto(rifaId: number, boletoId: number, datos: { vendedorId?: number; vendedorNombre?: string; compradorNombre?: string; compradorTelefono?: string }): Observable<Boleto> {
    return this.http.post<Boleto>(
      `${this.apiUrl}/${rifaId}/boletos/${boletoId}/pago`,
      datos,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Asignar propietario/vendedor sin cambiar el estado de venta
   */
  asignarPropietario(rifaId: number, boletoId: number, datos: { vendedorId?: number; vendedorNombre?: string }): Observable<Boleto> {
    return this.http.put<Boleto>(
      `${this.apiUrl}/${rifaId}/boletos/${boletoId}/propietario`,
      datos,
      { headers: this.getHeaders() }
    );
  }
}
