export interface ProgresoItem {
  id: number;
  titulo: string;
  progreso: number;
}

export interface ProgresoDia {
  fecha: string;
  tareas: ProgresoItem[];
}
