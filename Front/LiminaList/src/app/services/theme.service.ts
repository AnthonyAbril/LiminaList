import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  
  // Aplica colores al DOM y los guarda
  aplicarColores(colores: { [key: string]: string } | undefined | null) {
    if (!colores || typeof colores !== 'object') {
      console.warn('⚠️ No se pudieron aplicar colores: objeto inválido');
      return;
    }

    Object.entries(colores).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });

    localStorage.setItem('colores', JSON.stringify(colores));
  }


  // Carga y aplica los colores guardados (si existen)
  cargarColoresGuardados() {
    const raw = localStorage.getItem('colores');
    if (!raw) return;

    try {
      const colores = JSON.parse(raw);

      if (colores && typeof colores === 'object') {
        this.aplicarColores(colores);
      } else {
        console.warn('⚠️ El contenido de "colores" no es válido');
      }
    } catch (e) {
      console.error('❌ Error al aplicar colores guardados:', e);
    }
  }

  // Elimina los colores aplicados y los del localStorage
  limpiarColores() {
    ['primario', 'secundario', 'terciario', 'texto'].forEach(key => {
      document.documentElement.style.removeProperty(`--color-${key}`);
    });

    localStorage.removeItem('colores');
  }
}
