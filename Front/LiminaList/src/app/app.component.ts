import { Component } from '@angular/core';

import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { LoadingService } from './services/loading.service';
import { MidnightRefreshService } from './services/midnight-refresh.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'LiminaList';

  private intervaloModoOscuro: any;

  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private midnightRefresh: MidnightRefreshService,
    private themeService: ThemeService,
    private http: HttpClient,
    private auth: AuthService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (event instanceof NavigationEnd) {
        setTimeout(() => this.loadingService.hide(), 500);
      }
    });
  }

  ngOnInit(): void {
    this.midnightRefresh.iniciarRefresco();

    // Si el usuario está autenticado, aplicar modo oscuro automático si está activado
    const ajustesRaw = localStorage.getItem('ajustes');
    if (!ajustesRaw) return;

    try {
      const ajustes = JSON.parse(ajustesRaw);
      if (ajustes.modoOscuroAutomatico) {
        this.evaluarModoOscuro(); // evaluar ahora
        console.log("estamos en modo oscuro automatico?",ajustes.modoOscuroAutomatico);
        this.intervaloModoOscuro = setInterval(() => this.evaluarModoOscuro(), 6000);
      }
    } catch (e) {
      console.warn('⚠️ Ajustes inválidos en localStorage');
    }

    if(localStorage.getItem('user_id')&&localStorage.getItem('token'))
      this.auth.getAjustes(localStorage.getItem('token'));
    
  }

  ngOnDestroy(): void {
    clearInterval(this.intervaloModoOscuro);
  }

  evaluarModoOscuro(): void {
    const ahora = new Date();
    const horaActual = ahora.getHours() + ahora.getMinutes() / 60;


    if(localStorage.getItem('ajustes')){
          // Si el usuario está autenticado, aplicar modo oscuro automático si está activado
    const ajustesRaw = localStorage.getItem('ajustes');
    if (!ajustesRaw) return;
    const ajustes = JSON.parse(ajustesRaw);
      const [inicioH, inicioM] = ajustes.horaInicioAuto.split(':').map(Number);
      const [finH, finM] = ajustes.horaFinAuto.split(':').map(Number);
      const horaInicio = inicioH + inicioM / 60;
      const horaFin = finH + finM / 60;

      let activar = false;
      if (horaInicio < horaFin) {
        activar = horaActual >= horaInicio && horaActual < horaFin;
      } else {
        activar = horaActual >= horaInicio || horaActual < horaFin;
      }
        console.log("aqui",horaInicio,horaFin);
        console.log("aqui",ajustes.horaInicioAuto,ajustes.horaFinAuto,horaActual);
        console.log(activar);

      const patron = [...(ajustes.patronesDefault || []), ...(ajustes.patronesGuardados || [])]
        .find((p: any) => p.id === ajustes.patronActivo);

      if (patron) {
        const colores = activar ? patron.oscuro : patron.claro;
        this.themeService.aplicarColores(colores);
      }

      console.log("evaluado",);
    }

  }
}