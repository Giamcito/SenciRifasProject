import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Rifa } from '../models/rifa';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RifaService {
  private apiUrl = 'http://localhost:8080/api/rifas';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  crearRifa(rifa: Omit<Rifa, 'id' | 'usuarioId' | 'createdAt' | 'updatedAt'>): Observable<Rifa> {
    return this.http.post<Rifa>(this.apiUrl, rifa, { headers: this.getHeaders() });
  }

  obtenerRifas(): Observable<Rifa[]> {
    return this.http.get<Rifa[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerRifa(id: number): Observable<Rifa> {
    return this.http.get<Rifa>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  actualizarRifa(id: number, rifa: Omit<Rifa, 'id' | 'usuarioId' | 'createdAt' | 'updatedAt'>): Observable<Rifa> {
    return this.http.put<Rifa>(`${this.apiUrl}/${id}`, rifa, { headers: this.getHeaders() });
  }

  eliminarRifa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
