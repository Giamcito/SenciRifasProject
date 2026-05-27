import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Vendedor {
  id?: number;
  nombre: string;
  numeroCelular?: string;
  direccion?: string;
  parteDelDinero: number;
}

@Injectable({
  providedIn: 'root'
})
export class VendedorService {
  private apiUrl = 'http://localhost:8080/api/vendedores';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtiene los headers con el token JWT
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Crear un nuevo vendedor
   */
  crearVendedor(vendedor: Vendedor): Observable<Vendedor> {
    return this.http.post<Vendedor>(this.apiUrl, vendedor, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener todos los vendedores del usuario
   */
  obtenerVendedores(): Observable<Vendedor[]> {
    return this.http.get<Vendedor[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener un vendedor específico por ID
   */
  obtenerVendedor(id: number): Observable<Vendedor> {
    return this.http.get<Vendedor>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Actualizar un vendedor
   */
  actualizarVendedor(id: number, vendedor: Vendedor): Observable<Vendedor> {
    return this.http.put<Vendedor>(`${this.apiUrl}/${id}`, vendedor, {
      headers: this.getHeaders()
    });
  }

  /**
   * Eliminar un vendedor
   */
  eliminarVendedor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
