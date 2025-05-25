import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PanelComponent } from './panel.component';
import { TareasModule } from "../tareas/tareas.module";
import { ListasModule } from "../listas/listas.module";
import { FormsModule } from '@angular/forms';
import { AsignaTareaComponent } from '../asigna-tarea/asigna-tarea.component';

@NgModule({
  declarations: [
    PanelComponent
  ],
  imports: [
    CommonModule,
    TareasModule,
    FormsModule,
    AsignaTareaComponent,
    ListasModule,
    RouterModule.forChild([
      { path: '', component: PanelComponent } // Ruta interna del módulo
    ])
  ]
})
export class PanelModule { }