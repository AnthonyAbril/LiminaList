import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrincipalComponent } from './components/principal/principal.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    PrincipalComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
          { path: '', component: PrincipalComponent } // Ruta interna del módulo
        ])
  ],
  exports: [
    PrincipalComponent,
    RouterModule
  ]
})
export class PrincipalModule { }
