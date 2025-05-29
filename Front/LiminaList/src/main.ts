// src/main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// ✅ Aplicar colores del usuario antes de arrancar Angular
const colores = localStorage.getItem('colores');
if (colores) {
  const parsed = JSON.parse(colores);
  Object.entries(parsed).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value as string);
  });
}

platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
