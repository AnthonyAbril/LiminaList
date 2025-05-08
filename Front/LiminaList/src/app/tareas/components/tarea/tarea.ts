export interface Tarea {
    id: number;
    title: string;
    description?: string | null; // 🔹 Permitir `null`
    progreso: string | null;
    list_id?: number;
    padre?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    subtareas: Tarea[];
    terminado?: boolean; // 🔹 Agregado si está presente en la API
  }