// historico-drill.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartData, ChartOptions, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ListasService } from '../../services/listas.service';
import { ProgresoDia } from '../progreso-dia.model';

@Component({
  selector: 'app-historico-drill',
  standalone:false,
  templateUrl: './historico-drill.component.html'
})
export class HistoricoDrillComponent implements OnInit, OnChanges {
  @Input() historico!: ProgresoDia[];
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  nivel = 0;
  private stack: { titulo: string; tareaId: number }[] = [];

  public barChartOptions: ChartOptions = {
    responsive: true,
    plugins: { title: { display: true, text: 'Raíz: Progreso diario' } }
  };
  public barChartLabels: string[] = [];
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  constructor(private listas: ListasService) {}

  ngOnInit() {
    // Si al cargar la ruta ya tenemos datos, dibujamos
    if (this.historico) {
      this.resetGráfico();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['historico']) {
      // Cada vez que recibimos un nuevo array de historico,
      // limpiamos el stack y pintamos nivel raíz
      this.resetGráfico();
    }
  }

  private resetGráfico() {
    this.stack = [];
    this.nivel = 0;
    this.redibujar(this.historico, 'Raíz: Progreso diario');
  }

  private redibujar(data: ProgresoDia[], title: string) {
    const labels = Array.from(new Set(data.flatMap(d => d.tareas.map(t => t.titulo))));
    const datasets = data.map(d => ({
      label: d.fecha,
      data: labels.map(l => {
        const t = d.tareas.find(x => x.titulo === l);
        return t ? t.progreso : 0;
      })
    }));
    this.barChartLabels = labels;
    this.barChartData   = { labels, datasets };
    this.barChartOptions = {
      ...this.barChartOptions,
      plugins: { title: { display: true, text: title } }
    };
    this.chart?.update();
  }

  onChartClick({ active }: { active?: any[] }) {
    if (!active?.length) return;
    const idx    = active[0].index as number;
    const titulo = this.barChartLabels[idx];

    // buscamos el id en nuestro array base
    const item = this.historico
      .flatMap(d => d.tareas)
      .find(t => t.titulo === titulo);
    if (!item) return;

    // apilamos el estado actual
    this.stack.push({ titulo, tareaId: item.id });
    this.nivel++;

    // ahora pedimos sólo las subtareas de ese id
    this.listas.getHistorialProgresoPorTarea(item.id)
      .subscribe(sub => this.redibujar(sub, `Subtareas de ${titulo}`));
  }

  volver() {
    if (!this.stack.length) return;
    this.stack.pop();
    this.nivel--;

    if (this.nivel === 0) {
      this.resetGráfico();
    } else {
      const parent = this.stack[this.stack.length - 1];
      this.listas.getHistorialProgresoPorTarea(parent.tareaId)
        .subscribe(sub => this.redibujar(sub, `Subtareas de ${parent.titulo}`));
    }
  }
}
