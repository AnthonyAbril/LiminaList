import { Tarea } from "../tareas/components/tarea/tarea";

export interface Lista {
    id: string; // Cambiado de number a string
    name: string;
    user_id: number;
    created_at?: string | null;
    updated_at?: string | null;
    tareas: Tarea[];
}