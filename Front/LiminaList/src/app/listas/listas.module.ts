import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaComponent } from './components/lista/lista.component';
import { TareasModule } from "../tareas/tareas.module";
import { ListasComponent } from './listas.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ListaComponent,
    ListasComponent
  ],
  imports: [
    CommonModule,
    TareasModule,
    FormsModule,
    RouterModule.forChild([
      { path: 'panel/:id', component: ListaComponent }, // Ruta interna del módulo
      { path: 'lists', component: ListasComponent }, // Ruta interna del módulo
    ])
],
  exports: [ListaComponent]
})
export class ListasModule { }
