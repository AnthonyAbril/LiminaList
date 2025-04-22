import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isActive: boolean = false; // Controla si está activa la vista de registro
  login = { email: '', password: '' }; // Datos de inicio de sesión
  registro = { nombre: '', email: '', password: '' }; // Datos de registro

  constructor(private authService: AuthService) {}

  toggleRegister(): void {
    this.isActive = true; // Activa la vista de registro
  }

  toggleLogin(): void {
    this.isActive = false; // Activa la vista de inicio de sesión
  }

  iniciarSesion(): void {
    if (this.login.email && this.login.password) {
      this.authService.login(); // Llama al servicio para iniciar sesión
      console.log('Iniciando sesión con:', this.login);
    } else {
      alert('Por favor, completa todos los campos');
    }
  }

  registrarse(): void {
    if (this.registro.nombre && this.registro.email && this.registro.password) {
      console.log('Registrando usuario:', this.registro);
      alert('Registro completado con éxito');
    } else {
      alert('Por favor, completa todos los campos');
    }
  }
}