// src/app/historico/historico-drill/historico-drill.component.ts
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartData, ChartOptions, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ListasService } from '../../services/listas.service';
import { ProgresoDia } from '../progreso-dia.model';

@Component({
  selector: 'app-historico-drill',
  standalone:false,
  templateUrl: './historico-drill.component.html'
})
export class HistoricoDrillComponent implements OnInit {
  @Input() historico!: ProgresoDia[];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  nivel = 0;
  stack: { titulo: string; tareaId: number; fecha: string }[] = [];

  
  public barChartLabels: string[] = [];   // serán las fechas
  private tareaIds:   number[] = [];      // id de cada tarea por índice
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { title: { display: true, text: 'Progreso por día' } },
    scales: { x: { stacked: true }, y: { stacked: true } }
  };

  constructor(private listas: ListasService) {}

  ngOnInit() {
    this.listas.getHistorialRaiz().subscribe(data => {
      this.stack = [];
      this.nivel = 0;
      this.redibujar(data, 'Progreso raíces');
    });
  }



  // historico-drill.component.ts (sólo el método redibujar)
  private redibujar(data: ProgresoDia[], title: string) {
    // 1) extraigo días únicos
    const fechas = Array.from(new Set(data.map(d => d.fecha)));
    // 2) extraigo tareas únicas
    const tareas = Array.from(
      new Set(data.flatMap(d => d.tareas.map(t => t.titulo)))
    );
    // 3) guardo paralelo el id de cada tarea
    this.tareaIds = tareas.map(titulo => {
      const t = data
        .find(d => d.tareas.some(x => x.titulo === titulo))!
        .tareas.find(x => x.titulo === titulo)!;
      return t.id;
    });

    // 4) construyo datasets: uno por tarea, con un valor por fecha
    const datasets = tareas.map((titulo, i) => {
      const tarea = data
        .find(d => d.tareas.some(x => x.titulo === titulo))!
        .tareas.find(x => x.titulo === titulo)!;

      return {
        label: titulo,
        data: fechas.map(fecha => {
          const dia = data.find(d => d.fecha === fecha)!;
          const t = dia.tareas.find(x => x.titulo === titulo);
          return t?.progreso ?? 0;
        }),
        stack: 'a',
        tareaId: tarea.id    // <- esto es lo importante
      };
    });


    // 5) actualizo el chart
    this.barChartLabels = fechas;
    this.barChartData   = { labels: fechas, datasets };
    this.barChartOptions = {
      ...this.barChartOptions,
      plugins: { title: { display: true, text: title } },
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      }
    };
    this.chart?.update();
  }


  onChartClick({ active }: { active?: any[] }) {
    if (!active?.length) return;

    const { datasetIndex, index } = active[0];
    const tareaId = this.tareaIds[datasetIndex];
    const fecha   = this.barChartLabels[index];
    const titulo  = this.barChartData.datasets[datasetIndex].label as string;

    this.listas.getHistorialSubtareas(tareaId).subscribe(sub => {
      if (!sub.length) return; // 👈 no hay subtareas, no hacemos nada

      // guardar estado para volver
      this.stack.push({ tareaId, titulo, fecha });
      this.nivel++;

      this.redibujar(sub, `Subtareas de ${titulo}`);
    });
  }



  volver() {
    if (!this.stack.length) return;
    this.stack.pop();
    this.nivel--;
    if (this.nivel === 0) {
      this.listas.getHistorialProgreso().subscribe(root =>
        this.redibujar(root, 'Progreso por día')
      );
    } else {
      const parent = this.stack[this.stack.length - 1];
      this.listas.getHistorialSubtareas(parent.tareaId)
        .subscribe(sub => this.redibujar(sub, `Subtareas de ${parent.titulo}`));
    }
  }

}
