import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaVisorComponent } from './lista-visor.component';
import { FormsModule } from '@angular/forms';
import { ListaVisorRoutingModule } from './lista-visor-routing.module';



@NgModule({
  declarations: [ListaVisorComponent],
  imports: [
    CommonModule,
    FormsModule,
    ListaVisorRoutingModule
  ],
  exports: [
    ListaVisorComponent
  ]
})
export class ListaVisorModule { }
