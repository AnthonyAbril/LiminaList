
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';           // ← necesario para [(ngModel)]
import { RouterModule } from '@angular/router';

import { ListaVisorComponent } from './lista-visor.component';
import { CompartirModalComponent } from '../compartir-modal/compartir-modal.component'; // ← standalone
import { BorrarListaComponent } from '../borrar-lista/borrar-lista.component';

@NgModule({
  declarations: [ ListaVisorComponent ],
  imports: [
    CommonModule,
    FormsModule,
    CompartirModalComponent,                           // ← import standalone component
    BorrarListaComponent,
    RouterModule.forChild([
      { path: '', component: ListaVisorComponent }
    ])
  ]
})
export class ListaVisorModule { }
