import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaVisorComponent } from './lista-visor.component';

const routes: Routes = [
  { path: '', component: ListaVisorComponent } // ← Esto hace que /lists funcione
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListaVisorRoutingModule {}
