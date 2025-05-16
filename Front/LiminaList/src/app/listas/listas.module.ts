import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaComponent } from './components/lista/lista.component';
import { TareasModule } from "../tareas/tareas.module";
import { ListasComponent } from './listas.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ListaComponent,
    ListasComponent
  ],
  imports: [
    CommonModule,
    TareasModule,
    FormsModule,
],
  exports: [ListaComponent]
})
export class ListasModule { }
