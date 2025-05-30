import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tarea } from '../tarea/tarea';
import { ListasService } from '../../../services/listas.service';
import { RelojSyncService } from '../../../services/reloj-sync.service';
import { Subscription } from 'rxjs';

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
  subscripcionSync!: Subscription;

  pomodoroDuracion = 25 * 60; // en segundos
  descansoDuracion = 5 * 60;
  tiempoRestante = this.pomodoroDuracion;
  estaDescansando = false;
  temporizadorPomodoro: any;
  pomodoroActivo = false;

  modo: 'productivo' | 'hora' | 'pomodoro' = 'productivo';

  constructor(
    private listasService: ListasService,
    private relojSync: RelojSyncService
  ) {}

  ngOnInit(): void {
    this.actualizarHora();
    this.intervalo = setInterval(() => this.actualizarHora(), 1000);
    this.cargarTareasDelDia();

    this.subscripcionSync = this.relojSync.tareasActualizadas$.subscribe(() => {
      this.cargarTareasDelDia();
    });

    this.recuperarEstadoPomodoro(); // ⬅️ Esto es esencial
  }


  ngOnDestroy(): void {
    clearInterval(this.intervalo);
    this.subscripcionSync?.unsubscribe();
  }

  actualizarHora(): void {
    this.horaActual = new Date();

    if (this.modo === 'pomodoro' && this.pomodoroActivo) {
      this.tiempoRestante--;

      if (this.tiempoRestante <= 0) {
        this.estaDescansando = !this.estaDescansando;
        this.tiempoRestante = this.estaDescansando ? this.descansoDuracion : this.pomodoroDuracion;
        console.log(this.estaDescansando ? '🍵 Descanso' : '💼 Trabajo');
      }
    }
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

  // ───────────────────────────── Pomodoro ─────────────────────────────

  iniciarPomodoro(desdeRecuperacion = false): void {
    if (!desdeRecuperacion) {
      this.estaDescansando = false;
      this.tiempoRestante = this.pomodoroDuracion;
    }

    this.pomodoroActivo = true;

    this.temporizadorPomodoro = setInterval(() => {
      this.tiempoRestante--;

      localStorage.setItem('pomodoro', JSON.stringify({
        tiempoRestante: this.tiempoRestante,
        estaDescansando: this.estaDescansando,
        pomodoroActivo: this.pomodoroActivo,
        timestampInicio: Date.now()
      }));

      if (this.tiempoRestante <= 0) {
        this.estaDescansando = !this.estaDescansando;
        this.tiempoRestante = this.estaDescansando ? this.descansoDuracion : this.pomodoroDuracion;
        console.log(this.estaDescansando ? '🍵 Descanso' : '💼 Trabajo');
      }
    }, 1000);
  }

  detenerPomodoro(): void {
    clearInterval(this.temporizadorPomodoro);
    this.pomodoroActivo = false;
    localStorage.removeItem('pomodoro');
  }

  recuperarEstadoPomodoro(): void {
    const saved = localStorage.getItem('pomodoro');
    if (!saved) return;

    const { tiempoRestante, estaDescansando, pomodoroActivo, timestampInicio } = JSON.parse(saved);
    const elapsed = Math.floor((Date.now() - timestampInicio) / 1000);
    const nuevoTiempo = tiempoRestante - elapsed;

    if (pomodoroActivo && nuevoTiempo > 0) {
      this.estaDescansando = estaDescansando;
      this.pomodoroActivo = pomodoroActivo;
      this.tiempoRestante = nuevoTiempo;
      this.iniciarPomodoro(true);
    } else {
      this.detenerPomodoro();
    }
  }
}
