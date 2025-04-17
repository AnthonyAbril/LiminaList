import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PanelComponent } from './panel/panel.component';

const routes: Routes = [
  //{ path : 'login', component: LoginComponent },
  //{ path: '', redirectTo: '/login', pathMatch: 'full' },
  //{ path: '**', redirectTo: '/login', pathMatch: 'full' }
  { path: 'panel', loadChildren: () => import('./panel/panel.module').then(m => m.PanelModule) }, // Carga diferida de PanelModule
  //{ path: 'panel', component: PanelComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}