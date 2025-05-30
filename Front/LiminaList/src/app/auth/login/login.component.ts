import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isActive: boolean = false; // 🔹 Alterna entre login y registro
  intentandoAcceder = false;
  
  intentandoLogin = false;
  intentandoRegistro = false;
  errorLogin = ''; 
  errorRegistro = ''; 


  loginForm: FormGroup;
  registroForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private route: ActivatedRoute ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registroForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    localStorage.removeItem('token');     // token en localStorage
    localStorage.removeItem('colores-activos'); // ✅
    localStorage.removeItem('ajustes');
    sessionStorage.removeItem('token');   // token en sessionStorage
    sessionStorage.removeItem('user_id'); // también limpiar user_id
    
    // ✅ limpiar estilos aplicados del usuario anterior
    ['primario', 'secundario', 'terciario', 'texto'].forEach(key => {
      document.documentElement.style.removeProperty(`--color-${key}`);
    });
  }

  toggleRegister() {
    this.isActive = true;
  }

  toggleLogin() {
    this.isActive = false;
  }

  iniciarSesion(): void {
    this.intentandoLogin = true;
    this.errorLogin = '';

    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
        next: (response) => {
          if (response.access_token) {
            this.authService.saveToken(response.access_token);
            
            // Recuperamos la URL original
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
            this.router.navigate([returnUrl]);
          } else {
            this.errorLogin = '❌ Credenciales incorrectas';
          }
        },
        error: () => {
          this.errorLogin = '❌ Credenciales incorrectas o problema con el servidor';
        }
      });
    }
  }

  registrarse(): void {
    this.intentandoRegistro = true;
    this.errorRegistro = '';

    if (this.registroForm.valid) {
      this.authService.register(
        this.registroForm.value.name,
        this.registroForm.value.email,
        this.registroForm.value.password
      ).subscribe({
        next: () => {
          this.authService.login(
            this.registroForm.value.email,
            this.registroForm.value.password
          ).subscribe({
            next: (response) => {
              if (response.access_token) {
                this.authService.saveToken(response.access_token);

                
                this.router.navigate(['/home']);
              } else {
                this.errorRegistro = '❌ Error al autenticar después del registro';
              }
            },
            error: () => {
              this.errorRegistro = '❌ Hubo un problema al iniciar sesión después del registro';
            }
          });
        },
        error: (error) => {
          this.errorRegistro = error.status === 409 ? '❌ Este correo ya está en uso' : '❌ Error al registrar';
        }
      });
    }
  }
}