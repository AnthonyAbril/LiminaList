import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaComponent } from './components/lista/lista.component';
import { TareasModule } from "../tareas/tareas.module";



@NgModule({
  declarations: [
    ListaComponent
  ],
  imports: [
    CommonModule,
    TareasModule
],
  exports: [ListaComponent]
})
export class ListasModule { }
