import { Component, Input } from '@angular/core';

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
  //@Input() progreso: number = 0;

  // Estados posibles
  estados: string[] = ['No hecha', 'En proceso', 'Casi terminada', 'Hecha'];
  estadoActual: number = 0; // Índice del estado actual

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
}
