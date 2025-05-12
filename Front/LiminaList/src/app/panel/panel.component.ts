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

  constructor(private route: ActivatedRoute, private listasService: ListasService, private http: HttpClient) {}

  guardarCambiosLista(lista: Lista) {
    this.http.put(`http://localhost:8000/api/lists/${lista.id}`, lista).subscribe(response => {
      console.log('Lista guardada:', response);
    });
  }
  

  ngOnInit(): void {
    const listaId = this.route.snapshot.paramMap.get('id');
    if (listaId) {
      this.listasService.getListaPorId(listaId).subscribe(response => {
      this.listaSeleccionada = response;
      
      this.tareas = response.tareas.map((tarea: Tarea) => ({
        ...tarea,
        subtareas: tarea.subtareas || [] // 🔹 Asegurar que siempre es un array
      }));



      console.log('Tareas cargadas:', this.tareas);
    });
    }
  }

  

  toggleEdicion(): void {
    this.editar = !this.editar;
    console.log(this.editar);
  }

}
