import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  aplicarColores(colores: { [key: string]: string }) {
    Object.entries(colores).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
    localStorage.setItem('colores', JSON.stringify(colores)); // ✅ guardar solo lo activo
  }

  cargarColoresGuardados() {
    const raw = localStorage.getItem('colores');
    if (!raw) return;
    try {
      const colores = JSON.parse(raw);
      this.aplicarColores(colores);
    } catch (e) {
      console.error('❌ Error al aplicar colores guardados', e);
    }
  }
}
