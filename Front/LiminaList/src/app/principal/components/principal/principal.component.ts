import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ListasService } from '../../../services/listas.service';
import { Tarea } from '../../../tareas/components/tarea/tarea';

@Component({
  selector: 'app-principal',
  standalone: false,
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent {

  constructor(private listasService: ListasService, private router: Router) {
    this.generarCalendario();
  }

  dias: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  mesSeleccionado: number = new Date().getMonth(); // 🔹 Mes actual
  fechas: Date[] = [];
  
  generarCalendario() {
    this.fechas = []; // 🔹 Vaciar fechas anteriores
    const fechaActual = new Date();
    const primerDiaMes = new Date(fechaActual.getFullYear(), this.mesSeleccionado, 1);
    const ultimoDiaMes = new Date(fechaActual.getFullYear(), this.mesSeleccionado + 1, 0);

    for (let i = primerDiaMes.getDate(); i <= ultimoDiaMes.getDate(); i++) {
      this.fechas.push(new Date(fechaActual.getFullYear(), this.mesSeleccionado, i));
    }
  }


  cambiarMes() {
    this.generarCalendario(); // 🔹 Actualizar fechas cuando el usuario elige un mes
  }


  abrirListaDelDia(fecha: Date) {
    const listaId = `${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()}`; // 🔹 Formato: DD-MM-YYYY
    this.router.navigate(['/panel', listaId]); // 🔹 Redirigir a la lista diaria en /panel/(listaid)
  }


  ngOnInit(): void {
    this.listasService.getListas().subscribe(response => {
      this.listas = response;
      console.log(response);
    });
  }


  resumen: string = "listas";

  cambiarVista(vista: string) {
    this.resumen = vista; // 🔹 Cambia entre "calendar" y "listas"
  }


  //datos de prueba
  listas: any[] = [
    /*
    {
      created_at: "2025-04-26T22:23:00.000000Z",
      id : 4,
      name : "Mi anteprimera lista",
      tareas : [
        { 
          id: 1, 
          title: 'Leer sobre álgebra lineal', 
          description: 'Revisar el capítulo de matrices y determinantes.', 
          progreso: 30, 
          list_id: 4,
          padre: null,
          created_at : "2025-04-26T22:25:36.000000Z",
          updated_at : "2025-04-26T22:25:36.000000Z"
        }
      ],
      updated_at : "2025-04-26T22:23:00.000000Z",
      user_id : 3
    }
      */
  ];

  tareas: Tarea[] = [
    {
      id: 1,
      title: "Leer sobre álgebra lineal",
      description: "Revisar el capítulo de matrices y determinantes.",
      progreso: '',
      list_id: 4,
      padre: null,
      created_at: "2025-04-26T22:25:36.000000Z",
      updated_at: "2025-04-26T22:25:36.000000Z",
      subtareas: [
        {
          id: 2,
          title: "Ejercicios de algebra",
          description: null,
          progreso: '',
          list_id: 4,
          padre: 1,
          subtareas: [],
          created_at: null,
          updated_at: null
        }
      ]
    },
    {
        id: 3,
        title: "Estudiar Fisica",
        description: null,
        progreso: '',
        list_id: 4,
        padre: null,
        created_at: null,
        updated_at: null,
        subtareas: []
    }
  ]; // 🔹 Asegura que Angular reconozca `tareas`

  seleccionarLista(listaId: number): void {
    this.router.navigate(['/panel', listaId]); // 🔹 Redirige al usuario con el ID de la lista
  }

}
