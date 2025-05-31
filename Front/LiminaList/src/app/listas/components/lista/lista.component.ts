import { ChangeDetectorRef, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarea } from '../../../tareas/components/tarea/tarea';
import { ActivatedRoute } from '@angular/router';
import { TareasService } from '../../../services/tareas.service';
import { AuthService } from '../../../services/auth.service';
import { ViewChild } from '@angular/core';
import { NgxMaterialTimepickerComponent } from 'ngx-material-timepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ListasService } from '../../../services/listas.service';
import { updateNodeProgress  } from '../../helpers/list-utils';
import { RelojSyncService } from '../../../services/reloj-sync.service';

@Component({
  selector: 'app-lista',
  standalone: false,
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css'], // 🔹 Corregir aquí
  changeDetection: ChangeDetectionStrategy.OnPush   // 👈
})
export class ListaComponent {
  @Input() editar = false; // 🔹 Recibe la variable desde PanelComponent
  estadoActual = 0;
  tipoTarea:boolean = false;  //por defecto puntual
  
  @Input() tareas: Tarea[] = [];
  @Output() progresoActualizado = new EventEmitter<{ id: number; progreso: number }>();
  @ViewChild('picker') picker!: NgxMaterialTimepickerComponent;

  // en ListaComponent
  hoy = new Date().toISOString().split('T')[0];


  listaId;

  myTheme = {
    container: { 
      bodyBackgroundColor: "var(--color-terciario)",
      buttonColor: "var(--color-texto)",
    },
    dial: { dialBackgroundColor: "var(--color-primario)" },
    clockFace: { clockFaceInnerTimeInactiveColor:"var(--color-texto)",clockFaceBackgroundColor: "var(--color-terciario)", clockHandColor: "var(--color-primario)", clockFaceTimeInactiveColor: "var(--color-texto)" }
  };

  @Input() estados: { nombre: string; color: string }[] = [
    { nombre: 'Sin hacer', color: '#f87171' },
    { nombre: 'En progreso', color: '#facc15' },
    { nombre: 'Casi lista', color: '#fb923c' },
    { nombre: 'Hecha', color: '#4ade80' },
  ];

  

  selectedIndex: number = -1;

  openPicker(index: number) {
    //si es lista pasada no se puede editar
    this.selectedIndex = index;
    this.picker.open(); // ✅ Esto SÍ funciona
    this.tareas.forEach(element => {
      console.log("holi"+element.hora);
    });
  }

  onTimeChange(newTime: string) {
    if (this.selectedIndex >= 0) {
      const tarea = this.tareasPuntuales[this.selectedIndex];
      tarea.hora = newTime;

      if (!tarea.fecha) {
        console.warn('⚠ No se puede actualizar la hora: tarea sin fecha asignada');
        return;
      }

      const asignacion = {
        tarea_id: tarea.id,
        asignaciones: [
          {
            fecha: tarea.fecha,   // ahora garantizado como string
            hora: newTime
          }
        ]
      };

      this.tareasService.editarAsignacion(asignacion).subscribe({
        next: () => {console.log('⏰ Hora de la asignación actualizada'); this.relojSync.emitirActualizacion();},
        error: err => console.error('❌ Error al guardar hora:', err)
      });
    }
  }

  
  /** Convierte el array de tareas_fechas en una jerarquía única
   *  y recalcula el progreso de cada nodo               */
  buildTree(tfArray: any[]): any[] {

    /* ---------- 1) mapear cada fila a un nodo plano ---------- */
    const map = new Map<number, any>();

    tfArray.forEach(tf => {
      const nodo = {
        ...tf.tarea,
        progreso : tf.progreso ?? 0,    // valor REAL de la fila
        fecha    : tf.fecha,
        hora     : tf.hora,
        subtareas: [] as any[]
      };
      console.log( "< < "+tf.hora);
      map.set(nodo.id, nodo);
    });

    /* ---------- 2) enlazar padre-hijo ------------------------ */
    map.forEach(nodo => {
      if (nodo.padre && map.has(nodo.padre)) {
        map.get(nodo.padre)!.subtareas.push(nodo);
      }
    });

    /* ---------- 3)   bottom-up: progreso = media de hijos ---- */
    const calcular = (n: any): number => {
      if (n.subtareas.length === 0) {           // hoja
        return n.progreso;
      }
      const media = n.subtareas.reduce((s: number, h: any) => s + calcular(h), 0)
                  / n.subtareas.length;
      n.progreso = Math.floor(media);           // o Math.floor … como prefieras
      return n.progreso;
    };

    Array.from(map.values())
        .filter(n => !n.padre)                 // sólo raíces
        .forEach(calcular);

    /* ---------- 4)   devolver raíces ------------------------- */
    return Array.from(map.values()).filter(n => !n.padre);
  }

  onProgresoActualizado(event: { id: number; progreso: number }) {
    updateNodeProgress(this.tareas, event.id, event.progreso);
  }

  // helper en ListaComponent
  private esTareaRaiz(id: number): boolean {
    return this.tareas.some(t => t.id === id);
  }



  get tareasPuntuales() {
    const pts = this.tareas
      .filter(t => !t.rutinario)
      .sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? ''));

    console.log('🟡 tareasPuntuales:', pts);
    return pts;
  }


  get tareasRutinarias() {
    return this.tareas
      .filter(t => t.rutinario)
      .sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? ''));
  }

  constructor(private route: ActivatedRoute, private tareasService: TareasService, private authService: AuthService, private cd: ChangeDetectorRef, private relojSync: RelojSyncService) {
    this.listaId = this.route.snapshot.paramMap.get('id'); // Ahora listaId es string
  }

  // Método para añadir una nueva subtarea
  agregarTarea(): void {
    const nuevaTarea = {
      //id: Date.now(),const nuevaTarea = {
  id: Math.floor(Math.random() * 99999999), // 🔹 Mantenerlo dentro de `unsignedBigInteger`
      title: `Tarea ${this.tareas.length + 1}`, // title dinámico
      description: null,
      progreso: 0,
      list_id: this.listaId,
      user_id: Number(this.authService.getUserId()), // 🔹 Asegurar que `user_id` se envía correctamente
      padre: null,
      created_at: null,
      updated_at: null,
      subtareas: [] ,
      rutinario: this.tipoTarea // ✅ Por defecto es puntual
    };
    console.log(this.tareas);

    console.log('Datos enviados:', nuevaTarea);
    console.log('list_id:', nuevaTarea.list_id);
    console.log('user_id:', nuevaTarea.user_id);
    //se añade subtarea a backend
    this.tareasService.agregarTarea(nuevaTarea).subscribe({
      next: (response) => {
        console.log('✅ Tarea guardada en el backend:', response);
        this.cd.markForCheck();           // 👈 en vez de detectChanges()
        this.relojSync.emitirActualizacion();
        // 🔹 Aquí verifica si se está duplicando
        if (!response.title || response.title.trim() === '') {
          console.warn('⚠ Tarea sin título detectada, no se agrega al frontend.');
          return;
        }

      },
      error: (error) => {
        console.error('❌ Error al guardar tarea:', error);
      }
    });

    this.tareas.push(nuevaTarea); // Añade la nueva Tarea al array
  }


  eliminarTarea(tareaEliminada: Tarea): void {
  
    this.tareas.splice(this.tareas.indexOf(tareaEliminada), 1);

    this.tareasService.eliminarTarea(tareaEliminada.id).subscribe({
      next: () => {
        
        this.cd.markForCheck();           // 👈 en vez de detectChanges()
        console.log('✅ Tarea eliminada correctamente');
        this.relojSync.emitirActualizacion();
      },
      error: (error) => {
        console.error('❌ Error al eliminar tarea:', error);
      }
    });
  }

  toggleTipoTarea(){
    this.tipoTarea = !this.tipoTarea;
  }

  toggleState() {
    this.estadoActual = (this.estadoActual + 1) % this.estados.length;
  }
}
