import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListasService } from '../services/listas.service';

import { HttpClient } from '@angular/common/http';
import { Lista } from '../listas/lista';
import { Tarea } from '../tareas/components/tarea/tarea';

@Component({
  selector: 'app-panel',
  standalone: false,
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent {
  editar = false; // 🔹 Estado global del modo edición

  individual = false;

  listaSeleccionada: any;
  tareas: any[] = [];

  title:string = "";
  resumen: string = 'reloj';


  constructor(private route: ActivatedRoute, private listasService: ListasService, private http: HttpClient, private router: Router) {
    console.log('📌 Módulos cargados: ', this.constructor.name);
  }

  guardarCambiosLista(lista: Lista) {
    this.http.put(`http://localhost:8000/api/lists/${lista.id}`, lista).subscribe(response => {
      console.log('Lista guardada:', response);
    });
  }
  
  /** Convierte el array de tareas_fechas en una jerarquía única
   *  y recalcula el progreso de cada nodo               */
  buildTree(tfArray: any[], esDiaria: boolean = false): any[] {

    const map = new Map<number, any>();

    tfArray.forEach(tf => {
      const horaFinal = esDiaria && (tf.hora === null || tf.hora === undefined) ? '--:--' : tf.hora;

      const nodo = {
        ...tf.tarea,
        progreso : tf.progreso ?? 0,
        fecha    : tf.fecha,
        hora     : horaFinal,
        subtareas: [] as any[]
      };
      console.log("<>"+tf.hora);
      map.set(nodo.id, nodo);
    });

    map.forEach(nodo => {
      if (nodo.padre && map.has(nodo.padre)) {
        map.get(nodo.padre)!.subtareas.push(nodo);
      }
    });

    const calcular = (n: any): number => {
      if (n.subtareas.length === 0) return n.progreso;
      const media = n.subtareas.reduce((s: number, h: any) => s + calcular(h), 0) / n.subtareas.length;
      n.progreso = Math.floor(media);
      return n.progreso;
    };

    Array.from(map.values())
      .filter(n => !n.padre)
      .forEach(calcular);

    return Array.from(map.values()).filter(n => !n.padre);
  }




  //Sistema de mini-calendario
  
  dias: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  anioSeleccionado: number = new Date().getFullYear();
  mesSeleccionado: number = new Date().getMonth(); // Asegurar tipo number
  fechas: (Date | null)[] = [];


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


    esPasada: boolean = false;

    verificarFechaPasada(listaId: string): void {
      const año = parseInt(listaId.slice(1, 5), 10);
      const mes = parseInt(listaId.slice(5, 7), 10) - 1; // JavaScript meses: 0-11
      const dia = parseInt(listaId.slice(7, 9), 10);
      
      const fechaLista = new Date(Date.UTC(año, mes, dia));
      const hoy = new Date();
      const fechaHoy = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
      
      this.esPasada = fechaLista < fechaHoy;
    }


    abrirListaDelDia(fecha: Date | null): void {
      this.mostrarMiniSidebar = false;
      if (!fecha) return;

      const listaId = `D${fecha.getUTCFullYear()}${(fecha.getUTCMonth() + 1).toString().padStart(2, '0')}${fecha.getUTCDate().toString().padStart(2, '0')}`;

      this.router.navigate(['/panel', listaId]); // Si existe, navegar a la lista

      //Se vuelven a cargar las tareas asignadas a ese dia
      this.title = `${listaId?.substring(0, 5)}-${listaId?.substring(5, 7)}-${listaId?.substring(7, 9)}`.substring(1);

        this.listasService.getTareasPorFecha(listaId.substring(1)).subscribe({
          next: rows => {
            //console.log('📌 Datos de la fecha específica:', response);
            this.tareas = this.buildTree(rows,true);
          },
          error: err => console.error('Error cargando tareas de la fecha:', err)
        });
    }

    mostrarMiniSidebar = false;

    // por ejemplo:
    resumenChanged() {
      if (window.innerWidth <= 1161) {
        this.mostrarMiniSidebar = true;
      }
    }

    abrirResumen(tipo: string) {
      this.resumen = tipo;
      if (window.innerWidth <= 1161) {
        this.mostrarMiniSidebar = true;
      }
    }


    cerrarMiniSidebar(event: MouseEvent): void {
      this.mostrarMiniSidebar = false;
    }


    

  esMovil = window.innerWidth <= 1161;


  ngOnInit(): void {

  window.addEventListener('resize', () => {
    this.esMovil = window.innerWidth <= 1161;
  });
    
    this.generarCalendario();

    const listaId = this.route.snapshot.paramMap.get('id');

    //Lista de tareas
    if (listaId) {

      // … dentro de ngOnInit()
      if (listaId?.toString().startsWith('D')) {
        // ­──────── lista diaria ────────
        this.title = `${listaId.slice(1,5)}-${listaId.slice(5,7)}-${listaId.slice(7,9)}`;
        this.verificarFechaPasada(listaId);

        this.listasService.getTareasPorFecha(listaId.slice(1)).subscribe({
          next: rows => {
            this.tareas = this.buildTree(rows, true);   // 👈  usar helper
          },
          error: err => console.error('Error cargando tareas de la fecha:', err)
        });

      } else {
        console.log('individual');
        
        this.listasService.getListaPorId(listaId).subscribe(res => {
          this.listaSeleccionada = res;
          this.title = res.name;

          // ✅ AHORA: solo raíces; las subtareas se verán dentro del componente
          this.tareas = res.tareas
            .filter((t: Tarea) => !t.padre)               // ← sin padre ⇒ raíz
            .map((t: Tarea) => ({
              ...t,
              subtareas: Array.isArray(t.subtareas) ? t.subtareas : []
          }));
          
          console.log("1",this.tareas);
        });
      }
    }
  }

  

  toggleEdicion(): void {
    this.editar = !this.editar;
    console.log(this.editar);
  }

}
