import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Añade esta importación
import { CommonModule } from '@angular/common';
import { RelojComponent } from './components/reloj/reloj.component';
import { TareaComponent } from './components/tarea/tarea.component';



@NgModule({
  declarations: [
    RelojComponent,
    TareaComponent
  ],
  imports: [
    CommonModule,
    FormsModule // <-- Añade esto al array de imports
  ],
  exports: [
    RelojComponent,
    TareaComponent
  ]
})
export class TareasModule { }
