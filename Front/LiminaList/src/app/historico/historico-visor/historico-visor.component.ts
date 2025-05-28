// src/app/historico/historico-visor/historico-visor.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';

export interface ProgresoDia {
  fecha: string;
  tareas: { titulo: string; progreso: number }[];
}

@Component({
  selector: 'app-historico-visor',
  standalone:false,
  templateUrl: './historico-visor.component.html',
  styleUrls: ['./historico-visor.component.css']
})
export class HistoricoVisorComponent implements OnChanges {
  @Input() historico: ProgresoDia[] = [];

  // Opciones generales del gráfico
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Progreso diario por tarea' },
    },
  };

  // Datos y etiquetas que pasaremos al <canvas baseChart>
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public barChartLabels: string[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['historico']) {
      this.renderChart();
    }
  }

  private renderChart() {
    // 1) extraer lista única de títulos de tarea
    const allTasks = Array.from(
      new Set(
        this.historico.flatMap(d => d.tareas.map(t => t.titulo))
      )
    );

    // 2) usamos esos títulos como labels
    this.barChartLabels = allTasks;

    // 3) cada día del histórico genera un dataset
    this.barChartData = {
      labels: this.barChartLabels,
      datasets: this.historico.map(dia => ({
        label: dia.fecha,
        data: allTasks.map(titulo => {
          const t = dia.tareas.find(x => x.titulo === titulo);
          return t ? t.progreso : 0;
        }),
        // dejamos que ng2-charts asigne colores automáticamente
      }))
    };
  }
}
