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

  iniciarSesion(): void {
    this.intentandoLogin = true; // 🔹 Activamos la validación cuando el usuario intenta iniciar sesión

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          if (response.access_token) {
            this.authService.saveToken(response.access_token);
            this.router.navigate(['/home']);
          } else {
            alert('Credenciales incorrectas');
          }
        },
        error: (error) => {
          console.error('Error de autenticación:', error);
          alert('Credenciales incorrectas o problema con el servidor');
        }
      });
    }
  }


  intentandoRegistrar = false;

  registrarse(): void {

    this.intentandoRegistrar = true; // 🔹 Activamos el estado de validación al presionar el botón
  
    if (this.registroForm.valid) {
      const { nombre, email, password } = this.registroForm.value;
      this.authService.register(nombre, email, password).subscribe({
        next: (response) => {
          console.log('Usuario registrado con éxito:', response);
        },
        error: (error) => {
          console.error('Error en el registro:', error);
          alert('Hubo un problema al registrar el usuario. Inténtalo de nuevo.');
        }
      });
    }
  }

}