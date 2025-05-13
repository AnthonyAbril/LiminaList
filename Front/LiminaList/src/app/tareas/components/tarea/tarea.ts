export interface Tarea {
    id: number;
    title: string;
    description?: string | null;
    progreso: string | null;
    list_id?: string | null; // Permitir `null`
    user_id: number;
    padre?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    subtareas: Tarea[];
    terminado?: boolean;
}