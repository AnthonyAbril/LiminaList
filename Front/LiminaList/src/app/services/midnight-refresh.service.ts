import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MidnightRefreshService {
  constructor(private zone: NgZone) { }

  iniciarRefresco() {
    const ahora = new Date();
    const manana = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate() + 1,
      0, 0, 0, 0
    );

    const tiempoHastaMedianoche = manana.getTime() - ahora.getTime();

    // Usar NgZone para evitar problemas de detección de cambios
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        window.location.reload();
      }, tiempoHastaMedianoche);
    });
  }
}
