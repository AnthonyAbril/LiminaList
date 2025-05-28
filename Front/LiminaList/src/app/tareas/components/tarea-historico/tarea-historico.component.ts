import { Component, Input, OnInit } from '@angular/core';
import { TareasService } from '../../../services/tareas.service';

@Component({
  selector: 'app-tarea-historico',
  templateUrl: './tarea-historico.component.html',
  styleUrls: ['./tarea-historico.component.css'],
})
export class TareaHistoricoComponent implements OnInit {
  @Input() tareaId!: number;
  historico: { fecha: string; progreso: number }[] = [];

  constructor(private tareasService: TareasService) {}

  ngOnInit() {
    this.tareasService.getHistorialProgreso(this.tareaId)
      .subscribe(data => this.historico = data);
  }
}
