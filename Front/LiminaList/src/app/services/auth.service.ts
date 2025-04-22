import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioAutenticado = false; // Estado del login

  constructor(private router: Router) {}

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
  
}