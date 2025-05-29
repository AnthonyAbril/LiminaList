import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { RouterModule, Routes } from '@angular/router';

import { HistoricoPageComponent }  from './historico-page/historico-page.component';
import { HistoricoVisorComponent } from './historico-visor/historico-visor.component';
import { HistoricoDrillComponent } from './historico-drill/historico-drill.component';

const routes: Routes = [
  { path: '', component: HistoricoPageComponent }
];

@NgModule({
  declarations: [
    HistoricoPageComponent,
    HistoricoVisorComponent,
    HistoricoDrillComponent
  ],
  imports: [
    CommonModule,
    NgChartsModule,
    RouterModule.forChild(routes)
  ]
})
export class HistoricoModule {}
