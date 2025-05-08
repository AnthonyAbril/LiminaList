import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //private usuarioAutenticado = false; // Estado del login
  private apiUrl = 'http://localhost:8000/api'; // URL del backend

  constructor(private http: HttpClient, private router: Router) {}

/*
  login(): void {
    this.usuarioAutenticado = true;
    localStorage.setItem('auth', 'true'); // Guardar estado en almacenamiento local
    this.router.navigate(['/principal']); // Redirigir a la página principal
  }

  logout(): void {
    this.usuarioAutenticado = false;
    localStorage.removeItem('auth'); // Eliminar el estado de autenticación
    this.router.navigate(['/']); // Redirigir al login
  }

  estaAutenticado(): boolean {
    return localStorage.getItem('auth') === 'true'; // Comprueba si hay autenticación guardada
  }
    */

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
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token'); // Elimina el token de autenticación
    this.router.navigate(['/login']); // Redirige al login
  }

  estaAutenticado(): boolean {
    return !!this.getToken(); // Comprueba si hay un token almacenado
  }

  getUserData(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get(`${this.apiUrl}/user`, { headers });
  }

  
}