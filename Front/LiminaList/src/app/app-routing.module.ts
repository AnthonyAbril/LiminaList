import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './services/auth.guard';
import { AjustesUsuarioComponent } from './ajustes-usuario/ajustes-usuario.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    loadChildren: () => import('./principal/principal.module').then(m => m.PrincipalModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'lists',
    loadChildren: () => import('./lista-visor/lista-visor.module').then(m => m.ListaVisorModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'panel/:id',
    loadChildren: () => import('./panel/panel.module').then(m => m.PanelModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'ajustes',
    loadComponent: () => import('./ajustes-usuario/ajustes-usuario.component').then(m => m.AjustesUsuarioComponent),
    canActivate: [AuthGuard]
  },
  { path: 'historico', loadChildren: () => import('./historico/historico.module').then(m => m.HistoricoModule), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}