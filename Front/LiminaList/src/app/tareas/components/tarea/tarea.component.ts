import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';

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
  girando = false;
  readonly estados = ESTADOS;
  readonly coloresNivel = COLORES_NIVEL;

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  cambiarEstado(): void {
    this.estadoActual = (this.estadoActual + 1) % this.estados.length;
  }

  get progreso(): string {
    return this.subtareas.length === 0 ? '' : 
      `${this.subtareas.filter(sub => sub.terminado).length}/${this.subtareas.length}`;
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
      this.ajustarAltura(this.mostrarSubtareas);
    }
  }

  agregarSubtarea(): void {
    const nuevaSubtarea = {
      nombre: `Subtarea ${this.subtareas.length + 1}`,
      subtareas: [],
      terminado: false
    };
    
    const eraVacia = this.subtareas.length === 0;
    this.subtareas = [...this.subtareas, nuevaSubtarea];
    
    if (eraVacia) {
      // Cambio clave: Abrir inmediatamente sin esperar el siguiente ciclo
      this.mostrarSubtareas = true;
      this.ajustarAltura(true, true); // Sin delay para el primer ajuste
    } else if (!this.mostrarSubtareas) {
      this.mostrarSubtareas = true;
      this.ajustarAltura(true);
    } else {
      this.animarCambioAltura();
    }
  }

  onRightMouseDown(event: MouseEvent): void {
    if (event.button === 2) {
      event.preventDefault();
      this.girando = true;
    }
  }

  onRightMouseUp(event: MouseEvent): void {
    if (event.button === 2 && this.girando) {
      event.preventDefault();
      this.eliminar.emit();
      this.girando = false;
    }
  }

  eliminarSubtarea(index: number): void {
    this.subtareas = this.subtareas.filter((_, i) => i !== index);
    
    if (this.subtareas.length === 0) {
      this.mostrarSubtareas = false;
      this.ajustarAltura(true);
    } else {
      this.animarCambioAltura();
    }
  }

  private animarCambioAltura(): void {
    const element = this.subtareasContainer?.nativeElement;
    if (!element || !this.mostrarSubtareas) return;

    element.style.transition = 'none';
    const startHeight = element.scrollHeight;
    element.style.height = `${startHeight}px`;
    
    setTimeout(() => {
      element.style.transition = 'height 0.3s ease';
      element.style.height = `${element.scrollHeight}px`;
      
      setTimeout(() => {
        element.style.transition = '';
        element.style.height = 'auto';
      }, 300);
    }, 10);
  }

  private ajustarAltura(expandir: boolean, sinDelay: boolean = false): void {
    const element = this.subtareasContainer?.nativeElement;
    if (!element) return;

    if (expandir) {
      element.style.transition = sinDelay ? 'none' : 'height 0.3s ease';
      element.style.height = 'auto';
      const height = element.scrollHeight;
      element.style.height = '0';
      
      const delay = sinDelay ? 0 : 10;
      
      setTimeout(() => {
        element.style.height = `${height}px`;
        
        if (!sinDelay) {
          setTimeout(() => {
            element.style.transition = '';
            element.style.height = 'auto';
          }, 300);
        } else {
          element.style.transition = '';
          element.style.height = 'auto';
        }
      }, delay);
    } else {
      element.style.transition = 'none';
      element.style.height = `${element.scrollHeight}px`;
      
      setTimeout(() => {
        element.style.transition = 'height 0.3s ease';
        element.style.height = '0';
      }, 10);
    }
  }

  trackByTarea(index: number, tarea: Tarea): string {
    return `${index}-${tarea.nombre}`;
  }
}