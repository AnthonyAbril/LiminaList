import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrincipalComponent } from './components/principal/principal.component';
import { RouterModule } from '@angular/router';
import { TareasModule } from "../tareas/tareas.module";
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../services/auth.guard';


@NgModule({
  declarations: [
    PrincipalComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
        { path: '', component: PrincipalComponent} // Ruta interna del módulo
    ]),
    TareasModule,
    FormsModule
],
  exports: [
    PrincipalComponent,
    RouterModule
  ]
})
export class PrincipalModule { }
