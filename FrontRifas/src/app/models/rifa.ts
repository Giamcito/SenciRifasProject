export interface Rifa {
  id: number;
  nombre: string;
  cantidadBoletos: number;
  valorBoleto: number;
  usuarioId: number;
  gruposHabilitado?: boolean;
  valorGrupo?: number;
  createdAt: string;
  updatedAt: string;
}
