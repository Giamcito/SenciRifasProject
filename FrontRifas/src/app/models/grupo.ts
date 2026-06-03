export interface GrupoBoleto {
  id: number;
  rifaId: number;
  nombre: string;
  boletos?: Boleto[];
  valor: number;
  estadoVenta: string;
  compradorNombre?: string;
  compradorTelefono?: string;
  vendedorId?: number;
  vendedorNombre?: string;
  fechaVenta?: string;
  montoAbonado?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Boleto {
  id: number;
  rifaId: number;
  numero: string;
  estadoVenta: string;
  grupoId?: number | null;
  compradorNombre?: string;
  compradorTelefono?: string;
  vendedorId?: number;
  vendedorNombre?: string;
  fechaVenta?: string;
  montoAbonado?: number;
}
