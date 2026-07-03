import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Boleto, GrupoBoleto } from '../models/grupo';

export interface BoletoPageResponse {
  content: Boleto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private apiUrl = 'http://localhost:8080/api/rifas';

  constructor(private http: HttpClient) { }

  /**
   * Obtener todos los grupos de una rifa
   */
  obtenerGrupos(rifaId: number, token: string): Observable<GrupoBoleto[]> {
    const params = new HttpParams().set('token', token);
    return this.http.get<GrupoBoleto[]>(`${this.apiUrl}/${rifaId}/grupos`, { params });
  }

  /**
   * Crear una agrupación con vendedor y boletos seleccionados
   */
  crearAgrupacion(rifaId: number, vendedorId: number, boletoIds: number[], token: string): Observable<GrupoBoleto> {
    const params = new HttpParams().set('token', token);
    const body = { vendedorId, boletoIds };
    return this.http.post<GrupoBoleto>(`${this.apiUrl}/${rifaId}/grupos/agrupar`, body, { params });
  }

  /**
   * Crear un nuevo grupo
   */
  crearGrupo(rifaId: number, nombre: string, token: string): Observable<GrupoBoleto> {
    const params = new HttpParams().set('token', token);
    const body = { nombre };
    return this.http.post<GrupoBoleto>(`${this.apiUrl}/${rifaId}/grupos`, body, { params });
  }

  /**
   * Obtener un grupo específico
   */
  obtenerGrupo(rifaId: number, grupoId: number, token: string): Observable<GrupoBoleto> {
    const params = new HttpParams().set('token', token);
    return this.http.get<GrupoBoleto>(`${this.apiUrl}/${rifaId}/grupos/${grupoId}`, { params });
  }

  /**
   * Obtener boletos disponibles (no asignados a ningún grupo)
   */
  obtenerBoletosDisponibles(rifaId: number, busqueda?: string, token?: string, page: number = 0, size: number = 100): Observable<BoletoPageResponse> {
    let params = new HttpParams();
    if (token) {
      params = params.set('token', token);
    }
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    params = params.set('page', page.toString());
    params = params.set('size', size.toString());
    return this.http.get<BoletoPageResponse>(`${this.apiUrl}/${rifaId}/grupos/boletos-disponibles`, { params });
  }

  /**
   * Agregar boletos a un grupo
   */
  agregarBoletosAGrupo(rifaId: number, grupoId: number, boletoIds: number[], token: string): Observable<GrupoBoleto> {
    const params = new HttpParams().set('token', token);
    const body = { boletoIds };
    return this.http.post<GrupoBoleto>(`${this.apiUrl}/${rifaId}/grupos/${grupoId}/boletos`, body, { params });
  }

  /**
   * Remover boletos de un grupo
   */
  removerBoletosDelGrupo(rifaId: number, grupoId: number, boletoIds: number[], token: string): Observable<GrupoBoleto> {
    const params = new HttpParams().set('token', token);
    const body = { boletoIds };
    return this.http.post<GrupoBoleto>(`${this.apiUrl}/${rifaId}/grupos/${grupoId}/boletos/remover`, body, { params });
  }

  /**
   * Eliminar un grupo
   */
  eliminarGrupo(rifaId: number, grupoId: number, token: string): Observable<void> {
    const params = new HttpParams().set('token', token);
    return this.http.delete<void>(`${this.apiUrl}/${rifaId}/grupos/${grupoId}`, { params });
  }

  /**
   * Contar boletos en un grupo
   */
  contarBoletosEnGrupo(rifaId: number, grupoId: number, token: string): Observable<{ cantidad: number }> {
    const params = new HttpParams().set('token', token);
    return this.http.get<{ cantidad: number }>(`${this.apiUrl}/${rifaId}/grupos/${grupoId}/contar`, { params });
  }
}
