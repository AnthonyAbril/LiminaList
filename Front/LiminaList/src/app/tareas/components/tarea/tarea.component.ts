import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';

interface Tarea {
  nombre: string;
  subtareas: Tarea[];
  terminado: boolean;
  mostrarSubtareas: boolean;
}
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
  mostrarSubtareas: boolean = false; // Controla la visibilidad de las subtareas

  @ViewChild('subtareasContainer') subtareasContainer!: ElementRef;
  constructor(private cdr: ChangeDetectorRef) {}
  
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
  
  incrementarTamanoPadre(): void {
    const subtareasElement = this.subtareasContainer.nativeElement;
    let nuevoMax = subtareasElement.scrollHeight + 50; // Añadir espacio para nuevas subtareas
    subtareasElement.style.maxHeight = nuevoMax + 'px';
    this.cdr.detectChanges();
  }


  eliminarTarea(){
    this.eliminar.emit();
  }
  
  eliminarSubtarea(index: number): void {
    this.subtareas.splice(index, 1);
  }

  private ajustarAltura(element: HTMLElement, expandir: boolean): void {
    element.style.height = expandir ? element.scrollHeight + 'px' : '0';
  }
  

  // Método para alternar visibilidad
  
  toggleSubtareas(): void {
    this.mostrarSubtareas = !this.mostrarSubtareas;
    this.calcularAltura(this.mostrarSubtareas);
  }
  

  // Agregar subtarea
  
  agregarSubtarea(): void {
    const nuevaSubtarea: Tarea = {
      nombre: `Subtarea ${this.subtareas.length + 1}`,
      subtareas: [],
      terminado: false,
      mostrarSubtareas: true
    };
    this.subtareas.push(nuevaSubtarea);
  }

  private calcularAltura(expandir: boolean): void {
    const element = this.subtareasContainer.nativeElement;
    if (expandir) {
      element.style.height = element.scrollHeight + 'px';
      setTimeout(() => element.style.height = 'auto', 300);
    } else {
      element.style.height = element.scrollHeight + 'px';
      setTimeout(() => element.style.height = '0', 50);
    }
  }
}
