export interface Rifa {
  id: number;
  uniqueId?: string;
  nombre: string;
  cantidadBoletos: number;
  valorBoleto: number;
  usuarioId: number;
  gruposHabilitado?: boolean;
  cantidadAgrupacion?: number;
  valorGrupo?: number;
  cifras?: number;
  boletosGenerados?: boolean;
  createdAt: string;
  updatedAt: string;
}
