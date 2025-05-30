import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ListasService } from '../../../services/listas.service';
import { Tarea } from '../../../tareas/components/tarea/tarea';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Lista } from '../../../listas/lista';
import { updateNodeProgress  } from '../../../listas/helpers/list-utils';
import { TareasService } from '../../../services/tareas.service';

@Component({
  selector: 'app-principal',
  standalone: false,
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {
  nombreUsuario: string = '...'; // valor por defecto

  dias: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  anioSeleccionado: number = new Date().getFullYear();
  mesSeleccionado: number = new Date().getMonth(); // Asegurar tipo number
  fechas: (Date | null)[] = [];

  listas: any[] = [];
  tareas: any[] = [];
  resumen: string = 'listas';

  menuAbierto = false;

  constructor(private authService:AuthService, private listasService: ListasService, private tareasService: TareasService, private router: Router) {}

  ngOnInit(): void {
    this.listasService.getListas().subscribe({
      next: response => this.listas = response,
      error: err => console.error('Error cargando listas', err)
    });

    this.listasService.getTareasProximas(7).subscribe({
      next: response => {
        console.log('📌 Datos recibidos:', response); 

        // 🔹 Transformar datos para incluir fecha y hora en cada tarea (sin duplicacion de subtareas)
        this.tareas = this.buildTree(response);
        
        console.log('📌 Datos procesados:', this.tareas);
      },
      error: err => console.error('Error cargando eventos próximos:', err)
    });

    this.authService.getUserData().subscribe({
      next: user => this.nombreUsuario = user.name,
      error: err => {
        console.error('Error al obtener datos del usuario', err);
        this.nombreUsuario = 'Usuario';
      }
    });

    this.generarCalendario();
  }

  onProgresoActualizado(event: { id: number; progreso: number }) {
    updateNodeProgress(this.tareas, event.id, event.progreso);

    this.tareasService.editarProgreso(event.id, event.progreso, null).subscribe({
      next: () => console.log(`✅ Progreso de tarea ${event.id} actualizado a ${event.progreso}`),
      error: err => console.error(`❌ Error al guardar progreso de tarea ${event.id}:`, err)
    });
  }


  buildTree(tfArray: any[]): any[] {
    const map = new Map<number, any>();

    tfArray.forEach(tf => {
      const tarea = tf.tarea;
      const nodo = {
        ...tarea,
        subtareas: [],
        progreso: tf.progreso ?? 0,
        fecha: tf.fecha,
        hora: tf.hora
      };
      map.set(nodo.id, nodo);
    });

    map.forEach(nodo => {
      if (nodo.padre && map.has(nodo.padre)) {
        map.get(nodo.padre)!.subtareas.push(nodo);
      }
    });

    return Array.from(map.values()).filter(n => !n.padre);
  }


  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getUTCFullYear() === hoy.getUTCFullYear() &&
           fecha.getUTCMonth() === hoy.getUTCMonth() &&
           fecha.getUTCDate() === hoy.getUTCDate();
}

generarCalendario(): void {
    const año = Number(this.anioSeleccionado); // Conversión explícita
    const mes = Number(this.mesSeleccionado);   // Conversión explícita

    this.fechas = [];
    
    // 1. Calcular fechas en UTC
    const primerDia = new Date(Date.UTC(año, mes, 1));
    const ultimoDia = new Date(Date.UTC(año, mes + 1, 0));
    
    // 2. Calcular offset
    const offsetInicial = (primerDia.getUTCDay() + 6) % 7;
    
    // 3. Llenar nulls iniciales
    this.fechas = Array(offsetInicial).fill(null);
    
    // 4. Agregar días del mes CORRECTO
    const diasMes = ultimoDia.getUTCDate();
    for (let dia = 1; dia <= diasMes; dia++) {
        this.fechas.push(new Date(Date.UTC(año, mes, dia)));
    }
    
    // 5. Completar con nulls
    const totalCeldas = Math.ceil(this.fechas.length / 7) * 7;
    while (this.fechas.length < totalCeldas) {
        this.fechas.push(null);
    }
}

  cambiarMes(): void {
    this.generarCalendario();
  }

  abrirListaDelDia(fecha: Date | null): void {
    if (!fecha) return;

    const listaId = `D${fecha.getUTCFullYear()}${(fecha.getUTCMonth() + 1).toString().padStart(2, '0')}${fecha.getUTCDate().toString().padStart(2, '0')}`;

    this.router.navigate(['/panel', listaId]); // Si existe, navegar a la lista

    /*
    this.listasService.getListaPorId(listaId).subscribe({
      next: response => {
        console.log('✅ Lista encontrada:', response);
        this.router.navigate(['/panel', listaId]); // Si existe, navegar a la lista
      },
      error: () => {
        console.warn('⚠ Lista no encontrada, creando nueva automáticamente:', listaId);
        this.crearListaDelDia(listaId, fecha); // 🔹 Crear lista automáticamente
      }
    });
    */
  }

  logout(){
    this.authService.logout();
  }

  crearListaDelDia(listaId: string, fecha: Date): void {
    const nombreLista = `${fecha.getUTCDate()}/${fecha.getUTCMonth() + 1}/${fecha.getUTCFullYear()}`;
    const token = sessionStorage.getItem('token');
    const userId = Number(this.authService.getUserId());

    if (!token || !userId) {
      console.error('❌ No hay sesión activa.');
      return;
    }

    const listaData: Lista = { 
      id: listaId, 
      name: nombreLista, 
      user_id: userId, 
      tipo: 'diaria', // 🔹 Agregar tipo 'diaria'
      descripcion: 'Lista diaria',
      tareas: [] 
    };

    console.log('📌 Datos enviados:', listaData); // 🔹 Inspección de datos antes de enviar

    this.listasService.crearLista(listaData).subscribe({
      next: response => {
        console.log('✅ Lista del día creada:', response);
        this.router.navigate(['/panel', listaId]);
      },
      error: error => {
        console.error('❌ Error al crear la lista del día:', error);
        console.log('User ID en frontend:', Number(this.authService.getUserId())); 
      }
    });
  }

  cambiarVista(vista: string): void {
    this.resumen = vista;
  }

  seleccionarLista(listaId: string): void { // Cambiado de number a string
    this.router.navigate(['/panel', listaId]);
  }
}
