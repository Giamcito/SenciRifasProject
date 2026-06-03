export type EstadoVenta = 'DISPONIBLE' | 'AGRUPADA' | 'VENDIDO' | 'ABONADO' | 'RESERVADO' | 'CANCELADO';

export interface Boleto {
  id: number;
  rifaId?: number;
  numero: string;
  estadoVenta: EstadoVenta;
  grupoId?: number | null;
  grupoNombre?: string | null;
  grupoEstadoVenta?: string | null;
  grupoVendedorNombre?: string | null;
  grupoMontoAbonado?: number | null;
  grupoSaldoPendiente?: number | null;
  vendedorId?: number | null;
  vendedorNombre?: string | null;
  compradorNombre?: string | null;
  compradorTelefono?: string | null;
  fechaVenta?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  montoAbonado?: number;
}

export interface Estadisticas {
  total: number;
  vendidos: number;
  disponibles: number;
  abonados: number;
  totalRecaudado?: number;
}

export interface BoletoPage {
  content: Boleto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export const EstadoVentaValues: EstadoVenta[] = ['DISPONIBLE', 'AGRUPADA', 'VENDIDO', 'ABONADO', 'RESERVADO', 'CANCELADO'];
