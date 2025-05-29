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

  coloresClaro: Record<string, string> = {
    primario: '#FF9E16',
    secundario: '#FFBA5A',
    terciario: '#ffca81',
    texto: '#000000'
  };

  coloresOscuro: Record<string, string> = {
    primario: '#1e1e1e',
    secundario: '#2e2e2e',
    terciario: '#3e3e3e',
    texto: '#ffffff'
  };

  patronesDisponibles = [
    {
      id: 'default',
      nombre: 'Estándar',
      fijo: true,
      claro: { primario: '#FF9E16', secundario: '#FFBA5A', terciario: '#ffca81', texto: '#000000' },
      oscuro: { primario: '#1e1e1e', secundario: '#2e2e2e', terciario: '#3e3e3e', texto: '#ffffff' }
    },
    {
      id: 'minimalista',
      nombre: 'Minimalista',
      fijo: true,
      claro: { primario: '#ffffff', secundario: '#f0f0f0', terciario: '#d0d0d0', texto: '#000000' },
      oscuro: { primario: '#1c1c1c', secundario: '#2a2a2a', terciario: '#444', texto: '#ffffff' }
    }
  ];

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
      error: err => {
        console.error('Error al obtener datos del usuario', err);
        this.nombreUsuario = 'Usuario';
      }
    });
  }

  cambiarColor(tipo: string, event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.coloresActivos[tipo] = valor;
    this.aplicarColores();

    // Guarda con debounce (500ms)
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.guardarColoresEnServidor();
    }, 500);
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

  alternarModo() {
    this.aplicarColores();
  }

  guardarPatron() {
    const id = 'custom-' + Date.now();
    const nuevoPatron = {
      id,
      nombre: prompt('Nombre del nuevo patrón') || `Patrón ${Date.now()}`,
      fijo: false,
      claro: {
        primario: this.coloresClaro['primario'],
        secundario: this.coloresClaro['secundario'],
        terciario: this.coloresClaro['terciario'],
        texto: this.coloresClaro['texto']
      },
      oscuro: {
        primario: this.coloresOscuro['primario'],
        secundario: this.coloresOscuro['secundario'],
        terciario: this.coloresOscuro['terciario'],
        texto: this.coloresOscuro['texto']
      }
    };

    this.patronesDisponibles.push(nuevoPatron);
    localStorage.setItem('patronesUsuario', JSON.stringify(this.patronesDisponibles));
  }



  cargarPatron() {
    const patron = this.patronesDisponibles.find(p => p.id === this.patronSeleccionado);
    if (patron) {
      this.coloresClaro = patron.claro;
      this.coloresOscuro = patron.oscuro;
      this.aplicarColores();
    }
  }

  guardarColoresEnServidor(): void {
    const payload = {
      modoOscuro: this.modoOscuro,
      coloresClaro: this.coloresClaro,
      coloresOscuro: this.coloresOscuro,
      patronesGuardados: this.patronesDisponibles.filter(p => !p.fijo)
    };

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
    this.http.put('http://localhost:8000/api/ajustes', payload, { headers }).subscribe({
      next: () => {
        console.log('🎨 Ajustes guardados en backend');
        localStorage.setItem('colores', JSON.stringify(this.coloresActivos)); // ✅ también local
      },
      error: err => console.error('❌ Error al guardar ajustes:', err)
    });
  }




  getPatronesPredefinidos() {
    return [
      {
        id: 'default',
        nombre: 'Estándar',
        fijo: true,
        claro: this.getDefaultColors(),
        oscuro: this.getDarkDefaultColors()
      },
      {
        id: 'minimalista',
        nombre: 'Minimalista',
        fijo: true,
        claro: { primario: '#ffffff', secundario: '#f0f0f0', terciario: '#d0d0d0', texto: '#000000' },
        oscuro: { primario: '#1c1c1c', secundario: '#2a2a2a', terciario: '#444', texto: '#ffffff' }
      }
    ];
  }

  getDarkDefaultColors(): Record<string, string> {
    return {
      primario: '#1e1e1e',
      secundario: '#2e2e2e',
      terciario: '#3e3e3e',
      texto: '#ffffff'
    };
  }


  obtenerColoresDelServidor(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
    this.http.get<any>('http://localhost:8000/api/ajustes', { headers })
      .subscribe({
        next: ajustes => {
          if (ajustes && Object.keys(ajustes).length) {
            this.modoOscuro = ajustes.modoOscuro ?? false;
            this.coloresClaro = ajustes.coloresClaro ?? this.getDefaultColors();
            this.coloresOscuro = ajustes.coloresOscuro ?? this.getDarkDefaultColors();
            const custom = ajustes.patronesGuardados ?? [];

            // combina los predefinidos con los guardados
            this.patronesDisponibles = [
              ...this.getPatronesPredefinidos(),
              ...custom
            ];

            localStorage.setItem('ajustes', JSON.stringify(ajustes)); // ✅

          } else {
            this.coloresClaro = this.getDefaultColors();
            this.coloresOscuro = this.getDarkDefaultColors();
            localStorage.setItem('ajustes', JSON.stringify(ajustes)); // ✅
          }

          this.aplicarColores();
        },
        error: err => {
          console.error('❌ Error al cargar ajustes:', err);
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
    localStorage.setItem('colores', JSON.stringify(activos)); // ✅ solo guardamos los usados
  }

  getDefaultColors(): Record<string, string> {
    return {
      primario: '#FF9E16',
      secundario: '#FFBA5A',
      terciario: '#ffca81',
      texto: '#ffffff'
    };
  }
}
