import { Tarea } from "../tareas/components/tarea/tarea";

export interface Lista {
    id: string; // Cambiado de number a string
    name: string;
    user_id: number;
    tipo: 'individual' | 'diaria'; // 🔹 Ahora se define el tipo de lista
    created_at?: string | null;
    updated_at?: string | null;
    descripcion: string;
    colaboradores?: any[];
    tareas: Tarea[];
}