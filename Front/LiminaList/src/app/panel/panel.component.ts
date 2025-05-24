import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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


  constructor(private route: ActivatedRoute, private listasService: ListasService, private http: HttpClient) {
    console.log('📌 Módulos cargados: ', this.constructor.name);
  }

  guardarCambiosLista(lista: Lista) {
    this.http.put(`http://localhost:8000/api/lists/${lista.id}`, lista).subscribe(response => {
      console.log('Lista guardada:', response);
    });
  }
  

  ngOnInit(): void {
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
