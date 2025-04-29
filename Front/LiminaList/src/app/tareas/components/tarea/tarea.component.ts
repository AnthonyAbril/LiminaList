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
  @Input() editar = false; // 🔹 Recibe el estado desde ListaComponent

  @Output() eliminar = new EventEmitter<void>();
  @Output() actualizarNombre = new EventEmitter<string>();
  @ViewChild('subtareasContainer') subtareasContainer!: ElementRef;
  @ViewChild('nombreInput') nombreInput!: ElementRef;

  estadoActual = 0;
  mostrarSubtareas = false;
  girando = false;
  editandoNombre = false;
  nombreTemporal = '';
  animacionEnCurso = false;

  readonly estados = ESTADOS;
  readonly coloresNivel = COLORES_NIVEL;

  guardarNombre(): void {
    if (this.nombreTemporal.trim() !== '') { // Validar que el nombre no sea vacío
      this.actualizarNombre.emit(this.nombreTemporal);
      this.nombre = this.nombreTemporal; // Actualizar el nombre actual
    } else {
      alert('El nombre no puede estar vacío'); // Mostrar un mensaje al usuario
    }
    this.editandoNombre = false;
  }

  comenzarEdicion(event: MouseEvent): void {
    if (event.button === 2) { // Solo clic derecho
      event.preventDefault();
      event.stopPropagation(); // Esto evita que el evento se propague
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
    this.comenzarEdicion(event); // Llama al método de edición
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
      this.animarAltura(this.mostrarSubtareas);
    }
  }

  agregarSubtarea(): void {
    if (this.animacionEnCurso) return;
  
    const nuevaSubtarea = {
      nombre: `Subtarea ${this.subtareas.length + 1}`,
      subtareas: [],
      terminado: false
    };
  
    const estabaCerrado = !this.mostrarSubtareas;
    const eraVacia = this.subtareas.length === 0;
  
    if (!estabaCerrado && !eraVacia) {
      this.preAnimarAltura();
    }
  
    this.subtareas = [...this.subtareas, nuevaSubtarea];
  
    if (eraVacia) {
      this.mostrarSubtareas = true;
      const element = this.subtareasContainer?.nativeElement;
      if (!element) return;
  
      this.animacionEnCurso = true;
      setTimeout(() => {
        element.style.transition = 'none';
        element.style.height = '0px';
        void element.offsetHeight;
        element.style.transition = 'height 0.3s ease';
        element.style.height = `${element.scrollHeight}px`;
  
        setTimeout(() => {
          element.style.transition = '';
          element.style.height = 'auto';
          this.animacionEnCurso = false;
        }, 300);
      }, 0);
    } else if (estabaCerrado) {
      this.mostrarSubtareas = true;
      setTimeout(() => this.postAnimarAltura(true), 0);
    } else {
      this.postAnimarAltura(true);
    }
  }
  

  private alturaInicial = 0;

private preAnimarAltura(): void {
  const element = this.subtareasContainer?.nativeElement;
  if (!element) return;
  this.alturaInicial = element.scrollHeight;
}

private postAnimarAltura(expandir: boolean, instantaneo: boolean = false): void {
  const element = this.subtareasContainer?.nativeElement;
  if (!element) return;

  this.animacionEnCurso = true;

  setTimeout(() => {
    const nuevaAltura = expandir ? element.scrollHeight : 0;

    element.style.transition = 'none';
    element.style.height = `${this.alturaInicial}px`;
    void element.offsetHeight;

    if (!instantaneo) {
      element.style.transition = 'height 0.3s ease';
    }

    element.style.height = `${nuevaAltura}px`;

    const finish = () => {
      element.style.transition = '';
      if (expandir) {
        element.style.height = 'auto';
      }
      this.animacionEnCurso = false;
    };

    if (!instantaneo) {
      setTimeout(finish, 300);
    } else {
      finish();
    }
  }, 0);
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
    if (this.animacionEnCurso) return;
  
    this.preAnimarAltura();
    this.subtareas = this.subtareas.filter((_, i) => i !== index);
  
    if (this.subtareas.length === 0) {
      this.postAnimarAltura(false);
      setTimeout(() => {
        this.mostrarSubtareas = false;
      }, 300);
    } else {
      this.postAnimarAltura(true);
    }
  }

  private animarAltura(expandir: boolean, instantaneo: boolean = false): void {
    const element = this.subtareasContainer?.nativeElement;
    if (!element) return;
  
    // Paso 1: Si expandir, preparar la altura desde cero
    if (expandir) {
      element.style.transition = 'none';
      element.style.height = '0px';
    }
  
    setTimeout(() => {
      const startHeight = element.offsetHeight;
      const endHeight = expandir ? element.scrollHeight : 0;
  
      element.style.transition = 'none';
      element.style.height = `${startHeight}px`;
  
      // Forzar reflow
      void element.offsetHeight;
  
      if (!instantaneo) {
        element.style.transition = 'height 0.3s ease';
      }
  
      element.style.height = `${endHeight}px`;
  
      if (!instantaneo) {
        setTimeout(() => {
          element.style.transition = '';
          if (expandir) {
            element.style.height = 'auto';
          }
        }, 300);
      } else {
        element.style.transition = '';
        element.style.height = expandir ? 'auto' : '0px';
      }
    }, 0);
  }

  trackByTarea(index: number, tarea: Tarea): string {
    return `${index}-${tarea.nombre}`;
  }
}