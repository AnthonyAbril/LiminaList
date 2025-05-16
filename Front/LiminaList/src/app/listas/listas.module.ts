import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaComponent } from './components/lista/lista.component';
import { TareasModule } from "../tareas/tareas.module";
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ListaComponent,
  ],
  imports: [
    CommonModule,
    TareasModule,
    FormsModule,
    RouterModule.forChild([
      { path: 'panel/:id', component: ListaComponent }, // Ruta interna del módulo
    ])
],
  exports: [ListaComponent]
})
export class ListasModule { }
