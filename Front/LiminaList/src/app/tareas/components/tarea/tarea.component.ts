import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tarea',
  standalone: false,
  templateUrl: './tarea.component.html',
  styleUrl: './tarea.component.css'
})
export class TareaComponent {
  @Input() nombre!: string;
  @Input() subtareas: any[] = [];
  @Input() nivel: number = 0;
  @Output() eliminar = new EventEmitter<void>(); // Evento para notificar la eliminación
  //@Input() progreso: number = 0;

  // Estados posibles
  estados: string[] = ['No hecha', 'En proceso', 'Casi terminada', 'Hecha'];
  estadoActual: number = 0; // Índice del estado actual
  mostrarSubtareas: boolean = true; // Controla la visibilidad de las subtareas

  // Alternar visibilidad de las subtareas
  toggleSubtareas(): void {
    this.mostrarSubtareas = !this.mostrarSubtareas;
  
    // Plegar todas las subtareas al plegar esta tarea
    if (!this.mostrarSubtareas) {
      this.subtareas.forEach((sub: any) => {
        if (sub instanceof TareaComponent) {
          sub.mostrarSubtareas = false; // Plegar en cascada
        }
      });
    }
  }
  
  
  
  // Método para cambiar al siguiente estado
  cambiarEstado(): void {
    this.estadoActual = (this.estadoActual + 1) % this.estados.length;
  }

  // Método para calcular el progreso de las subtareas
  getProgreso(): string {
    const totalSubtareas = this.subtareas.length;
    const completadas = this.subtareas.filter(sub => sub.terminado).length;
    return `${completadas}/${totalSubtareas}`;
  }

  // Método para obtener la clase CSS según el estado
  getClasePorEstado(): string {
    return `estado-${this.estadoActual}`;
  }

  // Método para calcular la clase del color según el nivel
  getClasePorNivel(): string {
    const colorIndex = this.nivel % 3;
    return `color-${colorIndex}`;
  }

  // Método para añadir una nueva subtarea
  agregarSubtarea(): void {
    const nuevaSubtarea = {
      nombre: `Subtarea ${this.subtareas.length + 1}`, // Nombre dinámico
      subtareas: [], // Las subtareas empiezan vacías
      terminado: false // Estado inicial
    };
    this.subtareas.push(nuevaSubtarea); // Añade la nueva subtarea al array
  }

  // Método para eliminar la tarea
  eliminarTarea(): void {
    this.eliminar.emit(); // Emite un evento para notificar al componente padre
  }
  
  
}
