import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'; // 🔹 Importar Router
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

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


  loginForm: FormGroup;
  registroForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }


  toggleRegister(): void {
    this.isActive = true; // Activa la vista de registro
  }

  toggleLogin(): void {
    this.isActive = false; // Activa la vista de inicio de sesión
  }


  intentandoLogin = false;

  errorBackend: string = ''; // 🔹 Variable para guardar errores desde la API

  iniciarSesion(): void {
    this.intentandoLogin = true;
    this.errorBackend = ''; // 🔹 Resetear errores antes de la petición

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          if (response.access_token) {
            this.authService.saveToken(response.access_token);
            this.router.navigate(['/home']);
          } else {
            this.errorBackend = '❌ Credenciales incorrectas';
          }
        },
        error: (error) => {
          this.errorBackend = '❌ Credenciales incorrectas o problema con el servidor'; // 🔹 Captura errores del backend
        }
      });
    }
  }


  intentandoRegistrar = false;

  registrarse(): void {
    this.intentandoRegistrar = true;
    this.errorBackend = ''; // 🔹 Resetear errores antes de enviar
  
    if (this.registroForm.valid) {
      const { nombre, email, password } = this.registroForm.value;
      this.authService.register(nombre, email, password).subscribe({
        next: () => {
          console.log('Usuario registrado con éxito');
  
          // 🔹 Iniciar sesión automáticamente después del registro
          this.authService.login(email, password).subscribe({
            next: (response) => {
              if (response.access_token) {
                this.authService.saveToken(response.access_token);
                this.router.navigate(['/home']); // 🔹 Redirige a la página principal
              } else {
                this.errorBackend = '❌ Error al autenticar después del registro';
              }
            },
            error: () => {
              this.errorBackend = '❌ Hubo un problema al iniciar sesión después del registro';
            }
          });
        },
        error: (error) => {
          if (error.status === 409) {
            this.errorBackend = '❌ Este correo ya está en uso';
          } else {
            this.errorBackend = '❌ Error al registrar';
          }
        }
      });
    }
  }
  

}