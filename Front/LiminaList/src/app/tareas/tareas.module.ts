import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Añade esta importación
import { CommonModule } from '@angular/common';
import { RelojComponent } from './components/reloj/reloj.component';
import { TareaComponent } from './components/tarea/tarea.component';
import { AsignaTareaComponent } from "../asigna-tarea/asigna-tarea.component";



@NgModule({
  declarations: [
    RelojComponent,
    TareaComponent
  ],
  imports: [
    CommonModule,
    AsignaTareaComponent,
    FormsModule // <-- Añade esto al array de imports
    ,
    AsignaTareaComponent
],
  exports: [
    RelojComponent,
    TareaComponent
  ]
})
export class TareasModule { }
