import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-ajustes-usuario',
  templateUrl: './ajustes-usuario.component.html',
  styleUrls: ['./ajustes-usuario.component.css'],
  imports: [CommonModule, FormsModule]
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

  get coloresActivos(): Record<string, string> {
    return this.modoOscuro ? this.coloresOscuro : this.coloresClaro;
  }

  set coloresActivos(valor: Record<string, string>) {
    if (this.modoOscuro) this.coloresOscuro = valor;
    else this.coloresClaro = valor;
  }

  private debounceTimeout: any = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

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
      patronesGuardados: this.patronesDisponibles.filter(p => !p.fijo)
    };

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
    this.http.put('http://localhost:8000/api/ajustes', payload, { headers }).subscribe(() => {
      localStorage.setItem('colores', JSON.stringify(this.coloresActivos));
    });
  }

  obtenerColoresDelServidor(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
    this.http.get<any>('http://localhost:8000/api/ajustes', { headers }).subscribe({
      next: ajustes => {
        this.modoOscuro = ajustes.modoOscuro ?? false;
        this.patronSeleccionado = ajustes.patronActivo ?? 'default';

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
