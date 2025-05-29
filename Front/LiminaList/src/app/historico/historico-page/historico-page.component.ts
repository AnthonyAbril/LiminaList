// historico-page.component.ts
import { Component, OnInit } from '@angular/core';
import { ListasService } from '../../services/listas.service';
import { ProgresoDia } from '../progreso-dia.model';

@Component({
  selector: 'app-historico-page',
  standalone:false,
  template: `
    <h1>Histórico (Drill-down)</h1>
    <app-historico-drill [historico]="historico"></app-historico-drill>
  `
})
export class HistoricoPageComponent implements OnInit {
  historico: ProgresoDia[] = [];
  constructor(private listas: ListasService) {}
  ngOnInit() {
    this.listas.getHistorialProgreso().subscribe({
      next: data => this.historico = data,
      error: err => console.error(err)
    });
  }
}