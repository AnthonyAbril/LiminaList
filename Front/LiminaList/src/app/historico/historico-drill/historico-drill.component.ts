import { Component, Input, OnInit, ViewChild, HostListener } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ListasService } from '../../services/listas.service';
import { ProgresoDia } from '../progreso-dia.model';

@Component({
  selector: 'app-historico-drill',
  standalone: false,
  templateUrl: './historico-drill.component.html',
  styleUrls: ['./historico-drill.component.css']
})
export class HistoricoDrillComponent implements OnInit {
  @Input() historico!: ProgresoDia[];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  nivel = 0;
  stack: { titulo: string; tareaId: number; fecha: string }[] = [];
  currentData: ProgresoDia[] = [];
  currentTitle: string = 'Progreso por día';

  public barChartLabels: string[] = [];
  private tareaIds: number[] = [];
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public barChartOptions: ChartOptions<'bar'> = {};

  constructor(private listas: ListasService) {}


  ngOnInit() {
    this.listas.getHistorialRaiz().subscribe(data => {
      this.stack = [];
      this.nivel = 0;
      this.redibujar(data, 'Progreso raíces');
    });
  }

  getFontSize(base: number): number {
    return window.innerWidth < 500 ? base * 0.7 : base;
  }

  @HostListener('window:resize')
  onResize() {
    this.redibujar(this.currentData, this.currentTitle); // repinta con nueva escala
  }

  private redibujar(data: ProgresoDia[], title: string) {
    const colores = [
      '#f87171', '#60a5fa', '#fbbf24', '#34d399',
      '#a78bfa', '#f472b6', '#c084fc', '#facc15',
      '#4ade80', '#2dd4bf'
    ];

    this.currentTitle = title;

    // 🔽 Fecha actual sin hora
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyStr = hoy.toLocaleDateString('sv-SE'); // formato YYYY-MM-DD

    // 🔽 Solo fechas anteriores o iguales a hoy
    const dataFiltrada = data.filter(d => {
      const fecha = new Date(d.fecha);
      fecha.setHours(0, 0, 0, 0);
      return fecha <= hoy;
    });

    this.currentData = dataFiltrada;

    // 🔽 Fechas ordenadas descendente y etiquetamos "hoy"
    const fechasOriginales = Array.from(new Set(dataFiltrada.map(d => d.fecha)));
    const fechas = fechasOriginales
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(f => f === hoyStr ? `${f} (hoy)` : f);

    const tareas = Array.from(new Set(dataFiltrada.flatMap(d => d.tareas.map(t => t.titulo))));

    this.tareaIds = tareas.map(titulo => {
      const t = dataFiltrada.find(d => d.tareas.some(x => x.titulo === titulo))!
        .tareas.find(x => x.titulo === titulo)!;
      return t.id;
    });

    const datasets = tareas.map((titulo, i) => {
      const tarea = dataFiltrada.find(d => d.tareas.some(x => x.titulo === titulo))!
        .tareas.find(x => x.titulo === titulo)!;

      return {
        label: titulo,
        data: fechas.map(fechaLabel => {
          const fecha = fechaLabel.replace(' (hoy)', ''); // quitamos etiqueta
          const dia = dataFiltrada.find(d => d.fecha === fecha);
          const t = dia?.tareas.find(x => x.titulo === titulo);
          return t?.progreso ?? 0;
        }),
        stack: 'a',
        borderRadius: 6,
        backgroundColor: colores[i % colores.length],
        tareaId: tarea.id
      };
    });

    this.barChartLabels = fechas;
    this.barChartData = { labels: fechas, datasets };
    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        title: {
          display: true,
          text: title,
          color: 'var(--color-text)', // ✅ color del título
          font: {
            size: this.getFontSize(18),
            weight: 'bold',
          }
        },
        legend: {
          display: false,
          position: 'bottom',
          labels: {
            boxWidth: 12,
            color: 'var(--color-text)', // ✅ color de las etiquetas de leyenda
            font: {
              size: this.getFontSize(14)
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: 'var(--color-text)', // ✅ color de los valores en eje X
            font: {
              size: this.getFontSize(12)
            }
          },
          title: {
            display: true,
            text: 'Progreso (%)',
            color: 'var(--color-text)' // ✅ color del título del eje X
          }
        },
        y: {
          stacked: true,
          ticks: {
            color: 'var(--color-text)', // ✅ color de los valores en eje Y
            font: {
              size: this.getFontSize(12)
            }
          },
          title: {
            display: true,
            text: 'Fecha',
            color: 'var(--color-text)' // ✅ color del título del eje Y
          }
        }
      }
    };


    this.chart?.update();
  }



  onChartClick({ active }: { active?: any[] }) {
    if (!active?.length) return;

    const { datasetIndex, index } = active[0];
    const tareaId = this.tareaIds[datasetIndex];
    const fecha = this.barChartLabels[index];
    const titulo = this.barChartData.datasets[datasetIndex].label as string;

    this.listas.getHistorialSubtareas(tareaId).subscribe(sub => {
      if (!sub.length) return;
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
