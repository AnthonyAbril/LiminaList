import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'; // 🔹 Importar Router

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

  constructor(private authService: AuthService, private router: Router) {}

  toggleRegister(): void {
    this.isActive = true; // Activa la vista de registro
  }

  toggleLogin(): void {
    this.isActive = false; // Activa la vista de inicio de sesión
  }

  iniciarSesion(): void {
    if (this.login.email && this.login.password) {
      this.authService.login(this.login.email, this.login.password).subscribe({
        next: (response) => {
          if (response.access_token) {
            this.authService.saveToken(response.access_token);
            console.log('Autenticación exitosa, token recibido:', response.access_token);
            //this.router.navigate(['/home']); // 🔹 Redirige a Home después del login
            this.router.navigate(['/panel']); // 🔹 Redirige a Home después del login
          } else {
            alert('Credenciales incorrectas');
          }
        },
        error: (error) => {
          console.error('Error de autenticación:', error);
          alert('Credenciales incorrectas o problema con el servidor');
        }
      });
    } else {
      alert('Por favor, completa todos los campos');
    }
  }


  registrarse(): void {
    if (this.registro.nombre && this.registro.email && this.registro.password) {
      this.authService.register(this.registro.nombre, this.registro.email, this.registro.password).subscribe({
        next: (response) => {
          console.log('Usuario registrado con éxito:', response);
          
          // 🔹 Después del registro, iniciar sesión automáticamente
          this.authService.login(this.registro.email, this.registro.password).subscribe({
            next: (loginResponse) => {
              if (loginResponse.access_token) {
                this.authService.saveToken(loginResponse.access_token);
                this.router.navigate(['/home']); // Redirige a Home tras autenticación
              } else {
                alert('Error al autenticar tras el registro');
              }
            },
            error: (error) => {
              console.error('Error de autenticación tras el registro:', error);
              alert('Hubo un problema al autenticar el usuario recién registrado.');
            }
          });
        },
        error: (error) => {
          console.error('Error en el registro:', error);
          alert('Hubo un problema al registrar el usuario. Inténtalo de nuevo.');
        }
      });
    } else {
      alert('Por favor, completa todos los campos');
    }
  }
}