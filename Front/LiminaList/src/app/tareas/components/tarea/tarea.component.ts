import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy, HostListener, OnInit, OnDestroy, ChangeDetectorRef  } from '@angular/core';
import { Tarea } from './tarea';
import { TareasService } from '../../../services/tareas.service';
import { AuthService } from '../../../services/auth.service';
import { ListasService } from '../../../services/listas.service';
import { AsignacionOverlayService } from '../../../services/asignacion-overlay.service';

import { Subject, debounceTime, switchMap, takeUntil } from 'rxjs';
import { AfterViewInit } from '@angular/core';


const ESTADOS = ['No hecha', 'En proceso', 'Casi terminada', 'Hecha'] as const;
const COLORES_NIVEL = ['#ffca81', '#FF9E16', '#ffba5a'];

@Component({
  selector: 'app-tarea',
  templateUrl: './tarea.component.html',
  standalone: false,
  styleUrls: ['./tarea.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush   // 👈
})
export class TareaComponent implements OnInit, OnDestroy {
  @Input() id!: number;
  @Input() title!: string;
  @Input() subtareas: Tarea[] = [];
  @Input() nivel = 0;
  @Input() editar = false; // 🔹 Recibe el estado desde ListaComponent
  @Input() listaid:any = 0 ;
  @Input() rutinario:boolean|undefined = false ;
  @Input() progreso:number = 0;

  @Input() fecha:string|undefined = '--';
  @Input() hora:string|undefined = '--';

  @Input() tarea:Tarea = {
    id:0,
    title: "",
    progreso: 1,
    user_id:1,
    subtareas:[]
  };

  @Input() estados: { nombre: string; color: string }[] = [
    { nombre: 'Sin hacer', color: '#f87171' },
    { nombre: 'En progreso', color: '#facc15' },
    { nombre: 'Casi lista', color: '#fb923c' },
    { nombre: 'Hecha', color: '#4ade80' },
  ];

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

  constructor(
    private tareasService: TareasService,
    private authService: AuthService,
    private listasService: ListasService,
    private asignacionOverlayService: AsignacionOverlayService,
    private cd: ChangeDetectorRef
  ) {}



  /**  ➤  dispara cada vez que cambia el progreso de ESTA tarea  */
  private progreso$ = new Subject<{ prog: number; fecha: string | null }>();

  /**  ➤  para limpiar suscripciones al destruir el componente  */
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.progreso$
      .pipe(
        debounceTime(200),
        switchMap(({ prog, fecha }) =>
          this.tareasService.editarProgreso(this.id, prog, fecha)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next : () => console.log('✅ progreso guardado'),
        error: e  => console.error('❌ error guardando', e)
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private enviarProgreso(prog: number, fecha: string | null) {
    this.progreso$.next({ prog, fecha });
  }


  guardarNombre(): void {
    if (this.nombreTemporal.trim() !== '') {
      
          this.title = this.nombreTemporal; // 🔹 Sincronizar título actualizado
      this.tareasService.editarTarea(this.id, { title: this.nombreTemporal }).subscribe({
        next: (response) => {
          console.log('✅ Título actualizado:', response);
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

  abrirAsignador(): void {
    this.asignacionOverlayService.abrirAsignador(
      this.id,
      this.title,
      (fechasJson: string) => this.guardarFecha(fechasJson),
      (hora: string) => this.guardarHora(hora)
    );
  }



  guardarFecha(fechasJson: string) {
    const fechas = new Map(JSON.parse(fechasJson));

    const tareasFechas = Array.from(fechas.entries()).map(([fecha, hora]) => ({
      tarea_id: this.id,
      fecha,
      hora: hora === '--:--' ? null : hora
    }));

    this.listasService.asignarTareaFechas(tareasFechas).subscribe(/* … */);
  }




  guardarHora(hora: string) {
    this.hora = hora;
    console.log(`🕒 Hora guardada en la tarea: ${hora}`);
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
    if (this.subtareas.length > 0) return;

    const progviejo = this.progreso;
    this.progreso = (this.progreso + 1) % this.estados.length;

    this.progresoActualizado.emit({ id: this.id, progreso: this.progreso });

    const hoy = new Date().toISOString().split('T')[0];
    const necesitoFecha = this.rutinario && !( !this.fecha || this.fecha === '--' );  
    const fechaAUsar: string | null =
  this.fecha && this.fecha !== '--' ? this.fecha : null;

    this.enviarProgreso(this.progreso, fechaAUsar);
  }



  //esta funcion sirve para actualizar el array de subtareas del padre
  onProgresoActualizado(event: { id: number; progreso: number }) {
    // Actualizar progreso de la subtarea en el array
    const index = this.subtareas.findIndex(s => s.id === event.id);
    if (index !== -1) {
      this.subtareas[index].progreso = event.progreso;
    }

    console.log("Padre "+this.title+" actualiza sus subtareas");
    console.log(this.subtareas);

    // Esperar a que Angular renderice los cambios antes de recalcular
    this.actualizarEstadoDesdeSubtareas();
  }


  onActualizarEstadoPadre() {
    this.actualizarEstadoDesdeSubtareas();
    this.actualizarEstadoPadre.emit();  // para propagar al siguiente nivel
  }



  private progresoPorEstado: number[] = ESTADOS.map((_, i) =>
    i === 0 ? 100 : 100 * (1 - i / (ESTADOS.length - 1))
  );

  private calcularProgreso(): number {
    if (this.subtareas.length === 0) return this.progreso;

    const progresoPromedio =
      this.subtareas.reduce((suma, sub) => suma + sub.progreso, 0) / this.subtareas.length;

    // Evitar que el progreso calculado caiga a "Sin hacer" cuando hay subtareas avanzadas
    const progresoMinimo = Math.min(...this.subtareas.map(sub => sub.progreso));
    return Math.max(Math.floor(progresoPromedio), progresoMinimo);
  }

  actualizarEstadoDesdeSubtareas(): void {
    if (this.subtareas.length === 0) return;

    const progresoAnterior = this.progreso;
    const progresoNuevo = this.calcularProgreso();

    if (progresoAnterior === progresoNuevo) return;

    this.progreso = progresoNuevo;
    this.progresoActualizado.emit({ id: this.id, progreso: this.progreso });

    console.log(`🔄 Progreso recalculado de "${this.title}" → ${progresoAnterior} ➝ ${this.progreso}`);

    const hoy = new Date().toISOString().split('T')[0];

    // 🧠 No actualices progreso en backend si es tarea rutinaria con fecha pasada
    if (this.rutinario && this.fecha && this.fecha < hoy) {
      console.log(`⏳ Tarea rutinaria en día pasado. No se actualiza progreso.`);
      return;
    }

    // 🧠 Decide la fecha a usar
    const fechaAUsar: string | null =
  this.fecha && this.fecha !== '--' ? this.fecha : null;

    this.enviarProgreso(this.progreso, fechaAUsar);
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
      progreso: 0,
      list_id: this.listaid,
      user_id: Number(this.authService.getUserId()), // 🔹 Si `null`, asigna un valor por defecto
      padre: this.id,
      created_at: null,
      updated_at: null,
      terminado: false,
      rutinario: this.rutinario
    };

    console.log('➡ Subtarea a enviar:', nuevaSubtarea);
    this.actualizarEstadoDesdeSubtareas(); // 🔄 Recalcula progreso tras la adición

    //se añade subtarea a backend
    this.tareasService.agregarTarea(nuevaSubtarea).subscribe({
    next: (response) => {
      this.cd.markForCheck();           // ✔ avisa al motor
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
    
    this.actualizarEstadoDesdeSubtareas(); // 🔄 Recalcula progreso tras la adición

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
    
    this.actualizarEstadoDesdeSubtareas(); // 🔄 Recalcular progreso tras la elimi

    this.tareasService.eliminarTarea(tareaEliminada.id).subscribe({
      next: () => {
        this.cd.markForCheck();           // ✔ avisa al motor
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

  trackByTarea(_: number, tarea: Tarea): number {
    return tarea.id;
  }
}
