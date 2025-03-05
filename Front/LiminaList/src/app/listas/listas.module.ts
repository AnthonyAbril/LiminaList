import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaComponent } from './components/lista/lista.component';



@NgModule({
  declarations: [
    ListaComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [ListaComponent]
})
export class ListasModule { }
