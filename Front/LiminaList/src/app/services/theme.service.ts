import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root' // 👈 Esto es lo que hace que Angular lo registre globalmente
})
export class ThemeService {
  private intervaloAuto: any;
  private ajustes: any = null;

  public modoOscuro$ = new BehaviorSubject<boolean>(false);

  constructor(private zone: NgZone) {}

  iniciarAutoDarkMode(ajustes: any) {
    this.ajustes = ajustes;

    if (!ajustes.modoOscuroAutomatico) return;

    // Evaluar ya
    this.evaluarModoOscuro();

    // Evaluar cada minuto
    this.zone.runOutsideAngular(() => {
      this.intervaloAuto = setInterval(() => this.evaluarModoOscuro(), 60000);
    });
  }

  detenerAutoDarkMode() {
    clearInterval(this.intervaloAuto);
  }

  evaluarModoOscuro() {
    if (!this.ajustes || !this.ajustes.modoOscuroAutomatico) return;

    const ahora = new Date();
    const horaActual = ahora.getHours() + ahora.getMinutes() / 60;

    const [inicioH, inicioM] = this.ajustes.horaInicioAuto.split(':').map(Number);
    const [finH, finM] = this.ajustes.horaFinAuto.split(':').map(Number);

    const horaInicio = inicioH + inicioM / 60;
    const horaFin = finH + finM / 60;

    let activar = false;
    if (horaInicio < horaFin) {
      activar = horaActual >= horaInicio && horaActual < horaFin;
    } else {
      activar = horaActual >= horaInicio || horaActual < horaFin;
    }

    const patron = [...(this.ajustes.patronesDefault || []), ...(this.ajustes.patronesGuardados || [])]
      .find((p: any) => p.id === this.ajustes.patronActivo);

    if (patron) {
      const colores = activar ? patron.oscuro : patron.claro;
      this.aplicarColores(colores);
      this.modoOscuro$.next(activar);
    }
  }

  aplicarColores(colores: Record<string, string>) {
    Object.entries(colores).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
    localStorage.setItem('colores', JSON.stringify(colores));
  }

  cargarColoresGuardados() {
    const raw = localStorage.getItem('colores');
    if (!raw) return;

    try {
      const colores = JSON.parse(raw);
      this.aplicarColores(colores);
    } catch (e) {
      console.error('❌ Error aplicando colores guardados', e);
    }
  }

  limpiarColores() {
    ['primario', 'secundario', 'terciario', 'texto'].forEach(key => {
      document.documentElement.style.removeProperty(`--color-${key}`);
    });
    localStorage.removeItem('colores');
  }
}
