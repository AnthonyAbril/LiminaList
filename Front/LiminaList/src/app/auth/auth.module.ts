import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [LoginComponent], // ✅ Declarado solo aquí
  imports: [CommonModule, FormsModule],
  exports: [LoginComponent], // ✅ Permite su uso en otros módulos
})
export class AuthModule { }
