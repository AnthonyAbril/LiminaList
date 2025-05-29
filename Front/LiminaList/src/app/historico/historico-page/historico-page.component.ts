// historico-page.component.ts
import { Component, OnInit } from '@angular/core';
import { ListasService } from '../../services/listas.service';
import { ProgresoDia } from '../progreso-dia.model';

@Component({
  selector: 'app-historico-page',
  standalone:false,
  styleUrls: ['./historico-page.component.css'],
  template: `
    <div>
      <img [routerLink]="'/home'" src="assets/icons/house.svg" alt="Icono de Pluma" class="icono">
      <h1 style="font-size: 1.5rem; line-height: 1.2; word-break: break-word;">
        Histórico (Drill-down)
      </h1>
    </div>

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