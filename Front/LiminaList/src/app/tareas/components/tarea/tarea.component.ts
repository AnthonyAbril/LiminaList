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

  // Método para calcular la clase del color
  getClasePorNivel(): string {
    const colorIndex = this.nivel % 3; // Ciclar entre 0, 1 y 2
    return `color-${colorIndex}`;
  }
}

