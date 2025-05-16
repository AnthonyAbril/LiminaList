import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListasComponent } from './listas.component';
import { ListaComponent } from './components/lista/lista.component';

const routes: Routes = [
  { path: '', component: ListaComponent }, // ✅ Define qué componente se muestra por defecto en `/lists`
  { path: 'lists', component: ListasComponent } // ✅ Define qué componente se muestra por defecto en `/lists`
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // 🚀 Usar `forChild()` ya que es un módulo interno
  exports: [RouterModule]
})
export class ListasRoutingModule {}