import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { Tarea } from './tarea';
import { TareasService } from '../../../services/tareas.service';
import { AuthService } from '../../../services/auth.service';

const ESTADOS = ['No hecha', 'En proceso', 'Casi terminada', 'Hecha'] as const;
const COLORES_NIVEL = ['#ffca81', '#FF9E16', '#ffba5a'];

@Component({
  selector: 'app-tarea',
  templateUrl: './tarea.component.html',
  standalone: false,
  styleUrls: ['./tarea.component.css']
})
export class TareaComponent {
  @Input() id!: number;
  @Input() title!: string;
  @Input() subtareas: Tarea[] = [];
  @Input() nivel = 0;
  @Input() editar = false; // 🔹 Recibe el estado desde ListaComponent
  @Input() listaid:any = 0 ;
  @Input() rutinario:boolean|undefined = false ;
  @Input() estados: { nombre: string; color: string }[] = [
    { nombre: 'Hecha', color: '#4ade80' },
    { nombre: 'Sin hacer', color: '#f87171' },
    { nombre: 'En progreso', color: '#facc15' },
    { nombre: 'Casi lista', color: '#fb923c' },
  ];
  @Input() progreso:number=1;

  @Output() eliminar = new EventEmitter<void>();
  @Output() actualizarNombre = new EventEmitter<string>();
  @ViewChild('subtareasContainer') subtareasContainer!: ElementRef;
  @ViewChild('nombreInput') nombreInput!: ElementRef;
  @Output() actualizarEstadoPadre = new EventEmitter<void>();
  @Output() progresoActualizado = new EventEmitter<{ id: number; progreso: number }>();

  mostrarSubtareas = false;
  girando = false;
  editandoNombre = false;
  nombreTemporal = '';
  animacionEnCurso = false;

  //readonly estados = ESTADOS;
  readonly coloresNivel = COLORES_NIVEL;

  constructor(private tareasService: TareasService, private authService: AuthService){};

  guardarNombre(): void {
    if (this.nombreTemporal.trim() !== '') {
      this.tareasService.editarTarea(this.id, { title: this.nombreTemporal }).subscribe({
        next: (response) => {
          console.log('✅ Título actualizado:', response);
          this.title = response.title; // 🔹 Sincronizar título actualizado
        },
        error: (error) => {
          console.error('❌ Error al actualizar título:', error);
        }
      });
    } else {
      alert('El nombre no puede estar vacío');
    }
    this.editandoNombre = false;
  }



  comenzarEdicion(event: MouseEvent): void {
    event.preventDefault();
      event.stopPropagation(); // Esto evita que el evento se propague
      this.nombreTemporal = this.title;
      this.editandoNombre = true;
  
      setTimeout(() => {
        this.nombreInput.nativeElement.focus();
      }, 0);
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
    //this.comenzarEdicion(event); // Llama al método de edición
  }

  
  //metodo de tarea hoja
  cambiarEstado(): void {
    if (this.subtareas.length > 0) return; // Solo hojas

    this.progreso = (this.progreso + 1) % this.estados.length;

    // Emitir progreso actualizado al padre con id
    this.progresoActualizado.emit({ id: this.id, progreso: this.progreso });

    // Actualizar backend
    this.tareasService.editarTarea(this.id, { progreso: this.progreso, terminado: this.progreso === this.estados.length - 1 }).subscribe();
  }

  onProgresoActualizado(event: { id: number; progreso: number }) {
    // Actualizar progreso de la subtarea en el array
    const index = this.subtareas.findIndex(s => s.id === event.id);
    if (index !== -1) {
      this.subtareas[index].progreso = event.progreso;
    }

    // Recalcular progreso del padre con subtareas actualizadas
    this.actualizarEstadoDesdeSubtareas();
  }

  onActualizarEstadoPadre() {
    this.actualizarEstadoDesdeSubtareas();
    this.actualizarEstadoPadre.emit();  // para propagar al siguiente nivel
  }


  //metodo de tarea rama
  actualizarEstadoDesdeSubtareas(): void {
    if (this.subtareas.length === 0) return;  //si es tarea hoja, sale del metodo

      const totalSubtareas = this.subtareas.length;
    if (totalSubtareas === 0) return;

    // Paso 1: crear el mapa de progreso por índice
    const totalEstados = this.estados.length;
    const progresoPorEstado: number[] = [];

    for (let i = 0; i < totalEstados; i++) {
      progresoPorEstado[i] = i === 0
        ? 100
        : 100 * (1 - i / (totalEstados - 1));
    }

    // Paso 2: calcular promedio de progreso de subtareas
    const progresoTotal = this.subtareas.reduce((suma, sub) => {
      const estado = Number.isInteger(sub.progreso) ? sub.progreso : 1;
      return suma + (progresoPorEstado[estado] ?? 0);
    }, 0);


    const progresoPromedio = progresoTotal / totalSubtareas;

    // Paso 3: encontrar el estado más cercano al progreso promedio
    let estadoCercano = 0;
    let diferenciaMinima = Infinity;

    for (let i = 0; i < progresoPorEstado.length; i++) {
      const diferencia = Math.abs(progresoPromedio - progresoPorEstado[i]);
      if (diferencia < diferenciaMinima) {
        diferenciaMinima = diferencia;
        estadoCercano = i;
      }
    }

    // Paso 4: asignar estado correspondiente
    this.progreso = estadoCercano;


    // Aquí puedes hacer lo que necesites con el progreso, como asignarlo:
    const prog = estadoCercano;

    //const terminadas = this.subtareas.filter(t => t.progreso==0).length;  //calcular cuantas subtareas terminadas tiene  

    //const progresoCalculado = Math.ceil((terminadas / total) * (this.estados.length - 1));
    console.log(prog,this.progreso)

    this.progreso = prog;
    const terminado = this.progreso === this.estados.length - 1;

    
    this.actualizarEstadoPadre.emit();

    // Actualizar en backend
    this.tareasService.editarTarea(this.id, {
      progreso: this.progreso,
      //terminado
    }).subscribe({
      next: () => {
        console.log(`🔁 Estado recalculado para tarea ${this.id}(${this.title}): ${this.progreso} (${this.estados[this.progreso].nombre})`);
        // Emitir hacia su propio padre (propagación recursiva)
      },
      error: (err) => console.error('❌ Error actualizando estado padre:', err)
    });
  }

  get porcentajeProgreso(): string {
    return this.subtareas.length === 0 ? '' : 
      `${this.subtareas.filter(sub => sub.terminado).length}/${this.subtareas.length}`;
  }

  get claseEstado(): string {
    return `estado-${this.progreso}`;
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
      console.log('➡ Ejecutando agregarSubtarea()');
    if (this.animacionEnCurso) return;

    const nuevaSubtarea: Tarea = {
      id: Date.now(), // Genera un ID único temporal
      title: `Subtarea ${this.subtareas.length + 1}`,
      subtareas: [],
      progreso: 1,
      list_id: this.listaid,
      user_id: Number(this.authService.getUserId()), // 🔹 Si `null`, asigna un valor por defecto
      padre: this.id,
      created_at: null,
      updated_at: null,
      terminado: false,
      rutinario: this.rutinario
    };

  console.log('➡ Subtarea a enviar:', nuevaSubtarea);

    //se añade subtarea a backend
    this.tareasService.agregarTarea(nuevaSubtarea).subscribe({
    next: (response) => {
      console.log('✅ Subtarea guardada en el backend:', response);

      // 🔹 Aquí verifica si se está duplicando
      if (!response.title || response.title.trim() === '') {
        console.warn('⚠ Subtarea sin título detectada, no se agrega al frontend.');
        return;
      }

    },
    error: (error) => {
      console.error('❌ Error al guardar subtarea:', error);
    }
  });

  //empieza proceso de añadir tarea
  
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

    //termina proceso de añadir tarea

    


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
    const tareaEliminada = this.subtareas[index];

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

    this.tareasService.eliminarTarea(tareaEliminada.id).subscribe({
      next: () => {
        console.log('✅ Tarea eliminada correctamente');
      },
      error: (error) => {
        console.error('❌ Error al eliminar tarea:', error);
      }
    });
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
    return `${index}-${tarea.title}`;
  }
}
