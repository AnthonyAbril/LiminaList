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


  ngOnInit(): void {
    
    this.generarCalendario();

    const listaId = this.route.snapshot.paramMap.get('id');

    //Lista de tareas
    if (listaId) {

      if(listaId?.toString().startsWith("D")){
        console.log("diaria");
        //Lista diaria

        this.title = `${listaId?.substring(0, 5)}-${listaId?.substring(5, 7)}-${listaId?.substring(7, 9)}`.substring(1);

        this.listasService.getTareasPorFecha(listaId.substring(1)).subscribe({
          next: response => {
            console.log('📌 Datos de la fecha específica:', response);
            this.tareas = response.map((tareaFecha) => ({
              ...tareaFecha.tarea, 
              subtareas: tareaFecha.tarea.subtareas ?? [], 
              fecha: tareaFecha.fecha, 
              hora: tareaFecha.hora 
            }));
          },
          error: err => console.error('Error cargando tareas de la fecha:', err)
        });

        console.log('Tareas cargadas:', this.tareas);
      }else{
        console.log("individual");
        this.listasService.getListaPorId(listaId).subscribe(response => {
        this.listaSeleccionada = response;
        this.title = this.listaSeleccionada.name;
        this.tareas = response.tareas.map((tarea: Tarea) => ({
          ...tarea,
          subtareas: Array.isArray(tarea.subtareas) ? tarea.subtareas : [] // 🔹 Asegurar
        }));
      });
      }
    }
  }

  

  toggleEdicion(): void {
    this.editar = !this.editar;
    console.log(this.editar);
  }

}
