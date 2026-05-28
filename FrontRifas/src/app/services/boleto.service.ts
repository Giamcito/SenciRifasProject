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
  actualizarBoleto(boletoId: number, datos: { estadoVenta: string; compradorEmail?: string }): Observable<Boleto> {
    return this.http.put<Boleto>(
      `${this.apiUrl}/boletos/${boletoId}`,
      datos,
      { headers: this.getHeaders() }
    );
  }
}
