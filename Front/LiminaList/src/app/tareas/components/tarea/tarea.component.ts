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
  // Inputs y Outputs
  @Input() nombre!: string;
  @Input() subtareas: Tarea[] = [];
  @Input() nivel = 0;
  @Output() eliminar = new EventEmitter<void>();
  @Output() actualizarNombre = new EventEmitter<string>();
  @ViewChild('subtareasContainer') subtareasContainer!: ElementRef;
  @ViewChild('nombreInput') nombreInput!: ElementRef;
  constructor(private cdRef: ChangeDetectorRef) {}
  // Estado del componente
  estadoActual = 0;
  mostrarSubtareas = false;
  girando = false;
  editandoNombre = false;
  nombreTemporal = '';
  animacionEnCurso = false;

  // Constantes
  readonly estados = ESTADOS;
  readonly coloresNivel = COLORES_NIVEL;

  // Métodos de edición
  guardarNombre(): void {
    if (this.nombreTemporal.trim() !== '') {
      this.actualizarNombre.emit(this.nombreTemporal);
      this.nombre = this.nombreTemporal;
    } else {
      alert('El nombre no puede estar vacío');
    }
    this.editandoNombre = false;
  }

  comenzarEdicion(event: MouseEvent): void {
    if (event.button === 2) {
      event.preventDefault();
      event.stopPropagation();
      this.nombreTemporal = this.nombre;
      this.editandoNombre = true;
  
      setTimeout(() => {
        this.nombreInput.nativeElement.focus();
      }, 0);
    }
  }
  
  cancelarEdicion(): void {
    this.editandoNombre = false;
  }

  // Métodos de gestión de tareas
  cambiarEstado(): void {
    this.estadoActual = (this.estadoActual + 1) % this.estados.length;
  }

  // Método para alternar visibilidad con protección
  toggleSubtareas(): void {
    if (this.animacionEnCurso || this.subtareas.length === 0) return;
    
    this.mostrarSubtareas = !this.mostrarSubtareas;
    this.ajustarAltura(this.mostrarSubtareas);
  }


  // Método para agregar subtareas con animaciones completas
  agregarSubtarea(): void {
    if (this.animacionEnCurso) return;

    const nuevaSubtarea = {
      nombre: `Subtarea ${this.subtareas.length + 1}`,
      subtareas: [],
      terminado: false
    };

    const eraVacia = this.subtareas.length === 0;
    this.subtareas = [...this.subtareas, nuevaSubtarea];
    this.cdRef.detectChanges();

    // Siempre mostrar al agregar nueva subtarea
    if (!this.mostrarSubtareas) {
      this.mostrarSubtareas = true;
      this.ajustarAltura(true, eraVacia);
    } else {
      this.animarCambioAltura();
    }
  }
  

  // Métodos de eliminación
  eliminarSubtarea(index: number): void {
    this.subtareas = this.subtareas.filter((_, i) => i !== index);
    
    if (this.subtareas.length === 0) {
      this.mostrarSubtareas = false;
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

  // Host listeners
  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent): void {
    if (this.editandoNombre) {
      event.preventDefault();
      this.guardarNombre();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent): void {
    if (this.editandoNombre) {
      event.preventDefault();
      this.cancelarEdicion();
    }
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.comenzarEdicion(event);
  }

    // Animación para cambios de altura
  private animarCambioAltura(): void {
    if (this.animacionEnCurso) return;
    this.animacionEnCurso = true;
    
    const element = this.subtareasContainer?.nativeElement;
    if (!element || !this.mostrarSubtareas) {
      this.animacionEnCurso = false;
      return;
    }

    element.style.transition = 'none';
    const startHeight = element.scrollHeight;
    element.style.height = `${startHeight}px`;
    
    setTimeout(() => {
      element.style.transition = 'height 0.3s ease';
      element.style.height = `${element.scrollHeight}px`;
      
      setTimeout(() => {
        element.style.transition = '';
        element.style.height = 'auto';
        this.animacionEnCurso = false;
      }, 300);
    }, 10);
  }

  // Animación de apertura/cierre mejorada
  private ajustarAltura(expandir: boolean, sinDelay: boolean = false): void {
    this.animacionEnCurso = true;
    const element = this.subtareasContainer?.nativeElement;
    if (!element) {
      this.animacionEnCurso = false;
      return;
    }

    if (expandir) {
      element.style.transition = sinDelay ? 'none' : 'height 0.3s ease';
      element.style.height = 'auto';
      const height = element.scrollHeight;
      
      if (sinDelay) {
        element.style.height = `${height}px`;
        this.animacionEnCurso = false;
      } else {
        element.style.height = '0px';
        setTimeout(() => {
          element.style.height = `${height}px`;
          setTimeout(() => {
            element.style.transition = '';
            element.style.height = 'auto';
            this.animacionEnCurso = false;
          }, 300);
        }, 10);
      }
    } else {
      element.style.transition = 'none';
      element.style.height = `${element.scrollHeight}px`;
      
      setTimeout(() => {
        element.style.transition = 'height 0.3s ease';
        element.style.height = '0px';
        setTimeout(() => this.animacionEnCurso = false, 300);
      }, 10);
    }
  }

  // Helpers y propiedades computadas
  trackByTarea(index: number, tarea: Tarea): string {
    return `${index}-${tarea.nombre}`;
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
}