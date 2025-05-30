import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tarea } from '../tarea/tarea';
import { ListasService } from '../../../services/listas.service';

@Component({
  selector: 'app-reloj',
  standalone:false,
  templateUrl: './reloj.component.html',
  styleUrls: ['./reloj.component.css']
})
export class RelojComponent implements OnInit, OnDestroy {
  tareasHoy: Tarea[] = [];
  horaActual: Date = new Date();
  intervalo: any;

  constructor(private listasService: ListasService) {}

  ngOnInit(): void {
    this.actualizarHora();
    this.intervalo = setInterval(() => this.actualizarHora(), 1000);
    this.cargarTareasDelDia();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }

  actualizarHora(): void {
    this.horaActual = new Date();
  }

  cargarTareasDelDia(): void {
    const hoy = new Date();
    const fechaCompacta = `${hoy.getFullYear()}${(hoy.getMonth() + 1).toString().padStart(2, '0')}${hoy.getDate().toString().padStart(2, '0')}`;

    this.listasService.getTareasPorFecha(fechaCompacta).subscribe({
      next: tareasFechas => {
        const tareas = tareasFechas.map(tf => ({
          ...tf.tarea,
          progreso: tf.progreso ?? 0,
          fecha: tf.fecha,
          hora: tf.hora,
          subtareas: []
        }));

        const jerarquia = this.buildTree(tareas);
        this.tareasHoy = jerarquia
          .filter(t => t.hora)
          .sort((a, b) => (a.hora as string).localeCompare(b.hora as string));
      },
      error: err => console.error('❌ Error al obtener tareas:', err)
    });
  }

  buildTree(flatList: Tarea[]): Tarea[] {
    const map = new Map<number, Tarea>();

    flatList.forEach(t => map.set(t.id, t));

    flatList.forEach(t => {
      if (t.padre && map.has(t.padre)) {
        map.get(t.padre)!.subtareas.push(t);
      }
    });

    return Array.from(map.values()).filter(t => !t.padre);
  }

  get tareaActual(): Tarea | null {
    const minutosAhora = this.horaActual.getHours() * 60 + this.horaActual.getMinutes();
    for (let i = 0; i < this.tareasHoy.length; i++) {
      const inicio = this.minutosDeHora(this.tareasHoy[i].hora!);
      const fin = i + 1 < this.tareasHoy.length
        ? this.minutosDeHora(this.tareasHoy[i + 1].hora!)
        : 24 * 60;

      if (minutosAhora >= inicio && minutosAhora < fin) {
        return this.tareasHoy[i];
      }
    }
    return null;
  }

  get tareaSiguiente(): Tarea | null {
    const idx = this.tareasHoy.indexOf(this.tareaActual!);
    return idx !== -1 && idx + 1 < this.tareasHoy.length ? this.tareasHoy[idx + 1] : null;
  }

  minutosDeHora(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  formatearTiempo(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}:${m.toString().padStart(2, '0')}`;
  }
}
