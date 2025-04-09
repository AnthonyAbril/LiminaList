import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

interface Tarea {
  nombre: string;
  subtareas: Tarea[];
  terminado?: boolean;
}

const ESTADOS = ['No hecha', 'En proceso', 'Casi terminada', 'Hecha'] as const;
const COLORES_NIVEL = ['#ffca81', '#FF9E16', '#ffba5a'];

@Component({
  selector: 'app-tarea',
  templateUrl: './tarea.component.html',
  standalone: false,
  styleUrls: ['./tarea.component.css']
})
export class TareaComponent {
  @Input() nombre!: string;
  @Input() subtareas: Tarea[] = [];
  @Input() nivel = 0;
  @Output() eliminar = new EventEmitter<void>();
  @ViewChild('subtareasContainer') subtareasContainer!: ElementRef;

  estadoActual = 0;
  mostrarSubtareas = false;
  girarBoton = false;
  readonly estados = ESTADOS;
  readonly coloresNivel = COLORES_NIVEL;

  constructor(private cdr: ChangeDetectorRef) {}

  cambiarEstado(): void {
    this.estadoActual = (this.estadoActual + 1) % this.estados.length;
  }

  get progreso(): string {
    if (this.subtareas.length === 0) return '';
    const completadas = this.subtareas.filter(sub => sub.terminado).length;
    return `${completadas}/${this.subtareas.length}`;
  }

  get claseEstado(): string {
    return `estado-${this.estadoActual}`;
  }

  get claseNivel(): string {
    return `color-${this.nivel % this.coloresNivel.length}`;
  }

  toggleSubtareas(): void {
    if (this.subtareas.length > 0) {
      this.mostrarSubtareas = !this.mostrarSubtareas;
      this.ajustarAltura();
    }
  }

  agregarSubtarea(): void {
    const nuevaSubtarea = {
      nombre: `Subtarea ${this.subtareas.length + 1}`,
      subtareas: [],
      terminado: false
    };
    
    this.subtareas.push(nuevaSubtarea);
    
    // Abrir la tarea si está cerrada
    if (!this.mostrarSubtareas) {
      this.mostrarSubtareas = true;
      this.ajustarAltura(true);
    }
    
    this.cdr.detectChanges();
  }

  eliminarTarea(event: MouseEvent): void {
    event.preventDefault();
    this.girarBoton = true;
    
    // Esperar un momento para que se complete la animación
    setTimeout(() => {
      this.eliminar.emit();
      this.girarBoton = false;
    }, 300);
  }


  eliminarSubtarea(index: number): void {
    this.subtareas.splice(index, 1);
    this.ajustarAltura();
  }

  private ajustarAltura(expandir = this.mostrarSubtareas): void {
    if (!this.subtareasContainer || this.subtareas.length === 0) return;
    
    const element = this.subtareasContainer.nativeElement;
    element.style.height = expandir ? `${element.scrollHeight}px` : '0';
    
    if (expandir) {
      setTimeout(() => element.style.height = 'auto', 300);
    }
  }

  trackByTarea(index: number, tarea: Tarea): string {
    return `${index}-${tarea.nombre}`;
  }
}