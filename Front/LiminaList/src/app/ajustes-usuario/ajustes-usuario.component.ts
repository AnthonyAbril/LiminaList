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
  colores = {
    primario: '#FF9E16',
    secundario: '#FFBA5A',
    terciario: '#ffca81',
    texto: '#ffffff'
  };

  private debounceTimeout: any = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.obtenerColoresDelServidor();
  }

  cambiarColor(tipo: 'primario' | 'secundario' | 'terciario' | 'texto', event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    this.colores[tipo] = valor;

    document.documentElement.style.setProperty(`--color-${tipo}`, valor);
    localStorage.setItem('colores', JSON.stringify(this.colores));

    // Aplicar debounce antes de guardar en backend
    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.guardarColoresEnServidor();
    }, 600); // Espera 600ms después del último cambio
  }

  guardarColoresEnServidor(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
    this.http.put('http://localhost:8000/api/ajustes', this.colores, { headers })
      .subscribe({
        next: () => console.log('🎨 Ajustes guardados en el backend'),
        error: err => console.error('❌ Error al guardar ajustes:', err)
      });
  }

  obtenerColoresDelServidor(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
    this.http.get<any>('http://localhost:8000/api/ajustes', { headers })
      .subscribe({
        next: colores => {
          if (colores && Object.keys(colores).length) {
            this.colores = colores;
          } else {
            this.colores = this.getDefaultColors();
          }
          this.aplicarColores();
          localStorage.setItem('colores', JSON.stringify(this.colores));
        },
        error: err => {
          console.error('❌ Error al cargar ajustes:', err);
          this.colores = this.getDefaultColors();
          this.aplicarColores();
        }
      });
  }

  aplicarColores(): void {
    Object.entries(this.colores).forEach(([key, valor]) => {
      document.documentElement.style.setProperty(`--color-${key}`, valor);
    });
  }

  getDefaultColors() {
    return {
      primario: '#FF9E16',
      secundario: '#FFBA5A',
      terciario: '#ffca81',
      texto: '#ffffff'
    };
  }
}

