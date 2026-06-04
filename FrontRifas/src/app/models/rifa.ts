export interface Rifa {
  id: number;
  uniqueId?: string;
  nombre: string;
  cantidadBoletos: number;
  valorBoleto: number;
  usuarioId: number;
  gruposHabilitado?: boolean;
  valorGrupo?: number;
  createdAt: string;
  updatedAt: string;
}
