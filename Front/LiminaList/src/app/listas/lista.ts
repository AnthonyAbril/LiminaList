import { Tarea } from "../tareas/components/tarea/tarea";

export interface Lista {
    id: number;
    name: string;
    user_id: number;
    created_at?: string | null;
    updated_at?: string | null;
    tareas: Tarea[]; // 🔹 Relación con las tareas dentro de la lista
  }