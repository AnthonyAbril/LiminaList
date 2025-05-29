import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //private usuarioAutenticado = false; // Estado del login
  private apiUrl = 'http://localhost:8000/api'; // URL del backend

  constructor(private http: HttpClient, private router: Router, private theme: ThemeService) {}

  register(nombre: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { 
      name: nombre,  // 🔹 Cambiado 'nombre' a 'name' para que Laravel lo reciba correctamente
      email: email, 
      password: password 
    }).pipe(
      catchError((error) => {
        console.error('Código de error recibido:', error.status);
        console.error('Mensaje de error:', error.error.message);
        return throwError(() => error);
      })
    );
  }

  
  login(email: string, password: string): Observable<any> {
    return this.http.post<{ access_token: string; user: { id: number } }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.access_token && response.user.id) {
          sessionStorage.setItem('token', response.access_token);
          sessionStorage.setItem('user_id', response.user.id.toString());
          console.log(response.user.id.toString());
          
          // ✅ Pedir ajustes del usuario y aplicar sus colores activos
          const headers = new HttpHeaders().set('Authorization', `Bearer ${response.access_token}`);
          this.http.get<any>(`${this.apiUrl}/ajustes`, { headers }).subscribe({
            next: (ajustes) => {
              if (ajustes) {
                const modoOscuro = ajustes.modoOscuro ?? false;
                const colores = modoOscuro ? ajustes.coloresOscuro : ajustes.coloresClaro;

                // ✅ Guardar solo los colores activos en localStorage
                localStorage.setItem('colores-activos', JSON.stringify(colores));

                // ✅ Aplicar
                this.theme.aplicarColores(colores);

              }
            },
            error: (err) => console.warn('⚠️ No se pudieron cargar los colores tras login:', err)
          });
        }
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');     // token en localStorage
    localStorage.removeItem('colores-activos'); // ✅
    localStorage.removeItem('ajustes');
    sessionStorage.removeItem('token');   // token en sessionStorage
    sessionStorage.removeItem('user_id'); // también limpiar user_id
    
    // ✅ limpiar estilos aplicados del usuario anterior
    ['primario', 'secundario', 'terciario', 'texto'].forEach(key => {
      document.documentElement.style.removeProperty(`--color-${key}`);
    });
    
    this.router.navigate(['/login']);     // redirigir al login\
  }


  estaAutenticado(): boolean {
    const token = localStorage.getItem('token');  // ✅ corregido
    return !!token;
  }


  getUserData(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get(`${this.apiUrl}/user`, { headers });
  }

  
  getUserId(): number {
    return Number(sessionStorage.getItem('user_id')) || 0; // 🔹 Si `null`, asigna 0 como valor por defecto
  }

  
}