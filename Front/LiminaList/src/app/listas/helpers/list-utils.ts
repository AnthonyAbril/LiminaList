import { Tarea } from "../../tareas/components/tarea/tarea";


export function updateNodeProgress(nodos: Tarea[], id: number, prog: number): boolean {
  for (const n of nodos) {
    if (n.id === id) { n.progreso = prog; return true; }
    if (n.subtareas && updateNodeProgress(n.subtareas, id, prog)) { return true; }
  }
  return false;
}
