import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelojComponent } from './components/reloj/reloj.component';
import { TareaComponent } from './components/tarea/tarea.component';



@NgModule({
  declarations: [
    RelojComponent,
    TareaComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RelojComponent,
    TareaComponent
  ]
})
export class TareasModule { }
