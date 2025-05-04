import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListasService } from '../services/listas.service';

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

  constructor(private route: ActivatedRoute, private listasService: ListasService) {}

  ngOnInit(): void {
    const listaId = this.route.snapshot.paramMap.get('id');
    if (listaId) {
      this.listasService.getListaPorId(listaId).subscribe(response => {
        this.listaSeleccionada = response;

        this.tareas = response.tareas;

        console.log(this.tareas)
      });
    }
  }

  

  toggleEdicion(): void {
    this.editar = !this.editar;
    console.log(this.editar);
  }

}
