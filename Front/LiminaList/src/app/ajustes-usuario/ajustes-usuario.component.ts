import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { NgxMaterialTimepickerComponent, NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

@Component({
  standalone: true,
  selector: 'app-ajustes-usuario',
  templateUrl: './ajustes-usuario.component.html',
  styleUrls: ['./ajustes-usuario.component.css'],
  imports: [CommonModule, FormsModule,NgxMaterialTimepickerModule]
})
export class AjustesUsuarioComponent implements OnInit {
  nombreUsuario: string = '...';
  nuevoNombre: string = '';
  nuevaPass: string = '';
  patronSeleccionado: string = '';

  modoOscuro = false;

  coloresClaro: Record<string, string> = this.getDefaultColors();
  coloresOscuro: Record<string, string> = this.getDarkDefaultColors();

  patronesDisponibles: any[] = [];

  // 1) Añade ViewChilds para cada timepicker
  @ViewChild('pickerInicio') pickerInicio!: NgxMaterialTimepickerComponent;
  @ViewChild('pickerFin')    pickerFin!: NgxMaterialTimepickerComponent;

  modoOscuroAutomatico: boolean = false;
  horaInicioAuto: string = '21:00';
  horaFinAuto: string    = '07:00';

  private debounceAutoTimeout: any = null;
  // 3) NUEVO - método que setea horaInicioAuto cuando el usuario selecciona una hora
  onHoraInicioChange(newTime: string) {
    this.horaInicioAuto = newTime;
    // Reaplica la lógica de onAutoModeChange para guardar con debounce
    this.onAutoModeChange();
  }

  // 4) NUEVO - método que setea horaFinAuto cuando el usuario selecciona una hora
  onHoraFinChange(newTime: string) {
    this.horaFinAuto = newTime;
    // Reaplica la lógica de onAutoModeChange para guardar con debounce
    this.onAutoModeChange();
  }


  myTheme = {
    container: { 
      bodyBackgroundColor: "var(--color-terciario)",
      buttonColor: "var(--color-texto)",
    },
    dial: { dialBackgroundColor: "var(--color-primario)" },
    clockFace: {
      clockFaceInnerTimeInactiveColor: "var(--color-texto)",
      clockFaceBackgroundColor: "var(--color-terciario)",
      clockHandColor: "var(--color-primario)",
      clockFaceTimeInactiveColor: "var(--color-texto)"
    }
  };

  get coloresActivos(): Record<string, string> {
    return this.modoOscuro ? this.coloresOscuro : this.coloresClaro;
  }

  set coloresActivos(valor: Record<string, string>) {
    if (this.modoOscuro) this.coloresOscuro = valor;
    else this.coloresClaro = valor;
  }

  irAInicio() {
    this.router.navigate(['/home']);
  }

  private debounceTimeout: any = null;

  constructor(private http: HttpClient, private auth: AuthService, private router:Router, private themeService: ThemeService) {}

  ngOnInit(): void {
    this.obtenerColoresDelServidor();

    this.auth.getUserData().subscribe({
      next: user => {
        this.nombreUsuario = user.name;
        this.nuevoNombre = user.name;
      },
      error: () => {
        this.nombreUsuario = 'Usuario';
      }
    });
  }

  evaluarModoAutomatico(): void {
    if (!this.modoOscuroAutomatico) return;

    const ahora = new Date();
    const horaActual = ahora.getHours() + ahora.getMinutes() / 60;

    const [inicioH, inicioM] = this.horaInicioAuto.split(':').map(Number);
    const [finH, finM] = this.horaFinAuto.split(':').map(Number);
    const horaInicio = inicioH + inicioM / 60;
    const horaFin = finH + finM / 60;

    let activar = false;
    if (horaInicio < horaFin) {
      activar = horaActual >= horaInicio && horaActual < horaFin;
    } else {
      activar = horaActual >= horaInicio || horaActual < horaFin;
    }

    console.log(horaActual,horaInicio,horaFin);
    if (this.modoOscuro !== activar) {
      this.modoOscuro = activar;
      this.aplicarColores();
      this.guardarColoresEnServidor();
    }
  }

  onAutoModeToggle(): void {
    this.evaluarModoAutomatico();

    clearTimeout(this.debounceAutoTimeout);
    this.debounceAutoTimeout = setTimeout(() => {
      this.guardarColoresEnServidor();
    }, 800); // Espera 800ms después del último cambio
  }

  onAutoModeChange(): void {
    this.evaluarModoAutomatico();

    clearTimeout(this.debounceAutoTimeout);
    this.debounceAutoTimeout = setTimeout(() => {
      this.guardarColoresEnServidor();
    }, 800); // Igual que arriba
  }


  cambiarColor(tipo: string, event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.coloresActivos[tipo] = valor;
    this.aplicarColores();

    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.guardarColoresEnServidor();
    }, 500);
  }

  alternarModo() {
    this.aplicarColores();
    this.guardarColoresEnServidor();
    this.modoOscuroAutomatico = false;
  }

  cambiarNombre() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
    this.http.put('http://localhost:8000/api/user/update', { name: this.nuevoNombre }, { headers })
      .subscribe(() => this.nombreUsuario = this.nuevoNombre);
  }

  cambiarPassword() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
    this.http.post('http://localhost:8000/api/user/password', { password: this.nuevaPass }, { headers })
      .subscribe(() => alert('Contraseña actualizada'));
  }

  eliminarCuenta() {
    if (!confirm('¿Estás seguro? Esta acción no se puede deshacer.')) return;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
    this.http.delete('http://localhost:8000/api/user/delete', { headers })
      .subscribe(() => {
        alert('Cuenta eliminada');
        this.auth.logout();
      });
  }

  guardarPatron() {
    const id = 'custom-' + Date.now();
    const nombre = prompt('Nombre del nuevo patrón');

    if (nombre === null) return; // 👈 si canceló, salimos

    const nuevo = {
      id,
      nombre,
      fijo: false,
      claro: { ...this.coloresClaro },
      oscuro: { ...this.coloresOscuro }
    };

    this.patronesDisponibles.push(nuevo);
    this.guardarColoresEnServidor();
  }


  cargarPatron() {
    const patron = this.patronesDisponibles.find(p => p.id === this.patronSeleccionado);
    if (patron) {
      this.coloresClaro = patron.claro;
      this.coloresOscuro = patron.oscuro;
      this.aplicarColores();
      this.guardarColoresEnServidor();
    }
  }

  guardarColoresEnServidor(): void {
    const payload = {
      modoOscuro: this.modoOscuro,
      patronActivo: this.patronSeleccionado,
      patronesGuardados: this.patronesDisponibles.filter(p => !p.fijo),
      modoOscuroAutomatico: this.modoOscuroAutomatico,
      horaInicioAuto: this.horaInicioAuto,
      horaFinAuto: this.horaFinAuto
    };

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
        this.http.put('http://localhost:8000/api/ajustes', payload, { headers }).subscribe(() => {
      localStorage.setItem('colores', JSON.stringify(this.coloresActivos));

      const ajustesActualizados = {
        ...payload,
        patronesDefault: this.patronesDisponibles.filter(p => p.fijo),
        patronesGuardados: this.patronesDisponibles.filter(p => !p.fijo)
      };

      localStorage.setItem('ajustes', JSON.stringify(ajustesActualizados));

      // 🔁 Reiniciar auto dark mode con los nuevos valores
      this.themeService.detenerAutoDarkMode();
      this.themeService.iniciarAutoDarkMode(ajustesActualizados);
    });
  }


  obtenerColoresDelServidor(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
    this.http.get<any>('http://localhost:8000/api/ajustes', { headers }).subscribe({
      next: ajustes => {
        this.modoOscuro = ajustes.modoOscuro ?? false;
        this.patronSeleccionado = ajustes.patronActivo ?? 'default';
        this.modoOscuroAutomatico = ajustes.modoOscuroAutomatico ?? false;
        console.log(this.modoOscuro,this.modoOscuroAutomatico);
        this.horaInicioAuto = ajustes.horaInicioAuto ?? '21:00';
        this.horaFinAuto = ajustes.horaFinAuto ?? '07:00';

        const predefinidos = ajustes.patronesDefault ?? [];
        const personalizados = ajustes.patronesGuardados ?? [];

        this.patronesDisponibles = [...predefinidos, ...personalizados];

        this.cargarPatron();
        localStorage.setItem('ajustes', JSON.stringify(ajustes));
        this.aplicarColores();
      },
      error: () => {
        this.coloresClaro = this.getDefaultColors();
        this.coloresOscuro = this.getDarkDefaultColors();
        this.aplicarColores();
      }
    });
  }

  aplicarColores() {
    const activos = this.coloresActivos;
    Object.entries(activos).forEach(([key, valor]) => {
      document.documentElement.style.setProperty(`--color-${key}`, valor);
    });
    localStorage.setItem('colores', JSON.stringify(activos));
  }

  getDefaultColors(): Record<string, string> {
    return {
      primario: '#FF9E16',
      secundario: '#FFBA5A',
      terciario: '#ffca81',
      texto: '#000000'
    };
  }

  getDarkDefaultColors(): Record<string, string> {
    return {
      primario: '#402201',
      secundario: '#70410b',
      terciario: '#b26a14',
      texto: '#f0d9c2'
    };
  }
}
