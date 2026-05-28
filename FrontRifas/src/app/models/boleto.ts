export type EstadoVenta = 'DISPONIBLE' | 'VENDIDO' | 'ABONADO' | 'RESERVADO' | 'CANCELADO';

export interface Boleto {
  id: number;
  rifaId?: number;
  numero: string;
  estadoVenta: EstadoVenta;
  compradorEmail?: string | null;
  fechaVenta?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Estadisticas {
  total: number;
  vendidos: number;
  disponibles: number;
  abonados: number;
  totalRecaudado?: number;
}

export const EstadoVentaValues: EstadoVenta[] = ['DISPONIBLE', 'VENDIDO', 'ABONADO', 'RESERVADO', 'CANCELADO'];
