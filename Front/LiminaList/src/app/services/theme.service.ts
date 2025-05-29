// src/app/services/theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  aplicarColores(colores: { [key: string]: string }): void {
    Object.entries(colores).forEach(([clave, valor]) => {
      document.documentElement.style.setProperty(`--color-${clave}`, valor);
    });
  }
}
