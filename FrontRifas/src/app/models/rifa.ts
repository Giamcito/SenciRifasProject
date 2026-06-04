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
  createdAt: string;
  updatedAt: string;
}
