// src/app/historico/historico-page/historico-page.component.ts
import { Component, OnInit } from '@angular/core';
import { ListasService } from '../../services/listas.service';

interface ProgresoDia {
  fecha: string;
  tareas: { titulo: string; progreso: number }[];
}

@Component({
  selector: 'app-historico-page',
  standalone: false,
  template: `
    <h1>Histórico de Progreso</h1>
    <app-historico-visor [historico]="historico"></app-historico-visor>
  `
})
export class HistoricoPageComponent implements OnInit {
  historico: ProgresoDia[] = [];

  constructor(private listas: ListasService) {}

  ngOnInit() {
    this.listas  // o tareasService
      .getHistorialProgreso()
      .subscribe({
        next: data => this.historico = data,
        error: err => console.error('❌ No pude cargar el historial', err)
      });
  }

}
