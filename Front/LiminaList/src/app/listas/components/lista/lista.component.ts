import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarea } from '../../../tareas/components/tarea/tarea';
import { ActivatedRoute } from '@angular/router';
import { TareasService } from '../../../services/tareas.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-lista',
  standalone: false,
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css'] // 🔹 Corregir aquí
})
export class ListaComponent {
  @Input() editar = false; // 🔹 Recibe la variable desde PanelComponent
  estadoActual = 0;
  tipoTarea:boolean = false;  //por defecto puntual
  
  @Input() tareas: Tarea[] = [];
  @Output() progresoActualizado = new EventEmitter<{ id: number; progreso: number }>();

  listaId;

  @Input() estados: { nombre: string; color: string }[] = [
    { nombre: 'Sin hacer', color: '#f87171' },
    { nombre: 'En progreso', color: '#facc15' },
    { nombre: 'Casi lista', color: '#fb923c' },
    { nombre: 'Hecha', color: '#4ade80' },
  ];

  onProgresoActualizado({ id, progreso }: { id: number, progreso: number }) {
    const tarea = this.tareas.find(t => t.id === id);
    if (tarea) {
      tarea.progreso = progreso;
      console.log(`🔄 Progreso actualizado en ListaComponent: Tarea ${id} -> ${progreso}`);

      this.tareasService.editarTarea(id, { progreso }).subscribe({
        next: () => console.log(`✅ Progreso de tarea ${id} guardado en backend.`),
        error: (err) => console.error(`❌ Error al actualizar progreso en backend:`, err)
      });

      this.tareas = [...this.tareas]; // 🔄 Forzar actualización en Angular
    }
  }

  get tareasPuntuales() {
    return this.tareas.filter(t => !t.rutinario);
  }

  get tareasRutinarias() {
    return this.tareas.filter(t => !!t.rutinario);
  }

  constructor(private route: ActivatedRoute, private tareasService: TareasService, private authService: AuthService) {
    this.listaId = this.route.snapshot.paramMap.get('id'); // Ahora listaId es string
  }

  // Método para añadir una nueva subtarea
  agregarTarea(): void {
    const nuevaTarea = {
      //id: Date.now(),const nuevaTarea = {
  id: Math.floor(Math.random() * 99999999), // 🔹 Mantenerlo dentro de `unsignedBigInteger`
      title: `Tarea ${this.tareas.length + 1}`, // title dinámico
      description: null,
      progreso: 0,
      list_id: this.listaId,
      user_id: Number(this.authService.getUserId()), // 🔹 Asegurar que `user_id` se envía correctamente
      padre: null,
      created_at: null,
      updated_at: null,
      subtareas: [] ,
      rutinario: this.tipoTarea // ✅ Por defecto es puntual
    };
    console.log(this.tareas);

    console.log('Datos enviados:', nuevaTarea);
    console.log('list_id:', nuevaTarea.list_id);
    console.log('user_id:', nuevaTarea.user_id);
    //se añade subtarea a backend
    this.tareasService.agregarTarea(nuevaTarea).subscribe({
      next: (response) => {
        console.log('✅ Tarea guardada en el backend:', response);

        // 🔹 Aquí verifica si se está duplicando
        if (!response.title || response.title.trim() === '') {
          console.warn('⚠ Tarea sin título detectada, no se agrega al frontend.');
          return;
        }

      },
      error: (error) => {
        console.error('❌ Error al guardar tarea:', error);
      }
    });

    this.tareas.push(nuevaTarea); // Añade la nueva Tarea al array
  }


  eliminarTarea(tareaEliminada: Tarea): void {
  
    this.tareas.splice(this.tareas.indexOf(tareaEliminada), 1);

    this.tareasService.eliminarTarea(tareaEliminada.id).subscribe({
      next: () => {
        console.log('✅ Tarea eliminada correctamente');
      },
      error: (error) => {
        console.error('❌ Error al eliminar tarea:', error);
      }
    });
  }

  toggleTipoTarea(){
    this.tipoTarea = !this.tipoTarea;
  }

  toggleState() {
    this.estadoActual = (this.estadoActual + 1) % this.estados.length;
  }
}
