// src/app/historico/historico.module.ts
import { NgModule }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes }   from '@angular/router';
import { NgChartsModule }         from 'ng2-charts';

import { HistoricoPageComponent }  from './historico-page/historico-page.component';
import { HistoricoVisorComponent } from './historico-visor/historico-visor.component';

const routes: Routes = [
  { path: '', component: HistoricoPageComponent }
];

@NgModule({
  declarations: [
    HistoricoPageComponent,
    HistoricoVisorComponent
  ],
  imports: [
    CommonModule,
    NgChartsModule,
    RouterModule.forChild(routes)
  ]
})
export class HistoricoModule {}
