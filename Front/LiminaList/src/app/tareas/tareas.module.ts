import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TareasComponent } from './components/tareas/tareas.component';
import { RelojComponent } from './components/reloj/reloj.component';



@NgModule({
  declarations: [
    TareasComponent,
    RelojComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RelojComponent,
    TareasComponent
  ]
})
export class TareasModule { }
