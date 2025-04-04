import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tarea',
  standalone: false,
  templateUrl: './tarea.component.html',
  styleUrl: './tarea.component.css'
})
export class TareaComponent {
  @Input() nombre!: string;
  @Input() progreso!: string;
  @Input() subtareas: any[] = [];
  @Input() nivel: number = 0;
  terminado: boolean = false; // Estado de la tarea actual

  // Método para calcular la clase del color
  getClasePorNivel(): string {
    const colorIndex = this.nivel % 3; // Ciclar entre 0, 1 y 2
    return `color-${colorIndex}`;
  }
  

  // Método para calcular el progreso de las subtareas
  getProgreso(): string {
    const totalSubtareas = this.subtareas.length;
    const completadas = this.subtareas.filter(sub => sub.terminado).length;
    return `${completadas}/${totalSubtareas}`;
  }

  // Método para verificar si la tarea está completamente terminada
  checkTerminada(): void {
    this.terminado = this.subtareas.length > 0 && this.subtareas.every(sub => sub.terminado);
  }

}

