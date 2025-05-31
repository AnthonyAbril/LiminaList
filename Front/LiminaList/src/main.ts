// src/main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// ✅ Aplicar colores del usuario antes de arrancar Angular
// src/main.ts
const stored = localStorage.getItem('colores');
console.log("colores obtenidos: ",stored)
console.log(localStorage.getItem('ajustes'));
console.log("id del usuario local: ",localStorage.getItem('user_id'));
if (stored) {
  try {
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object') {
      Object.entries(parsed).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value as string);
      });
    }
  } catch (e) {
    console.warn('❌ Colores inválidos', e);
  }
}



platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
