import { Tarea } from "../tareas/components/tarea/tarea";


export interface TareaFecha {
    fecha: string;
    hora?: string;
    tarea: Tarea; // ✅ Garantiza que cada `TareaFecha` tiene una `Tarea`
}