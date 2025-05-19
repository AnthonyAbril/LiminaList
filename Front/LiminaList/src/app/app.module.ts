import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // ✅ Necesario para [(ngModel)]
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ListasModule } from './listas/listas.module';
import { TareasModule } from './tareas/tareas.module';
import { PrincipalModule } from './principal/principal.module';
import { AuthModule } from './auth/auth.module';
import { HttpClientModule } from '@angular/common/http';
import { LoadingComponent } from './loading/components/loading/loading.component';
import { ListaVisorComponent } from './lista-visor/lista-visor.component';
import { BorrarListaComponent } from './borrar-lista/borrar-lista.component';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
  ],
  imports: [
    HttpClientModule,
    AuthModule, // ✅ Importa el módulo de autenticación
    BrowserModule,
    FormsModule, // ✅ Agregar aquí para habilitar [(ngModel)]
    ReactiveFormsModule,  // ✅ Esto permitirá el uso de formularios reactivos en la aplicación.
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
