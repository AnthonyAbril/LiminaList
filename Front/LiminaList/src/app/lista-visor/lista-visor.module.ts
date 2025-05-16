import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // ✅ importante

import { ListaVisorComponent } from './lista-visor.component';

@NgModule({
  declarations: [ListaVisorComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: ListaVisorComponent } // ← aquí defines la ruta
    ])
  ]
})
export class ListaVisorModule { }
