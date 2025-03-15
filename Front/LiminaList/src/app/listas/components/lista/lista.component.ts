import { Component } from '@angular/core';

@Component({
  selector: 'app-lista',
  standalone: false,
  templateUrl: './lista.component.html',
  styleUrl: './lista.component.css'
})
export class ListaComponent {
  estados = ['Opción 1', 'Opción 2', 'Opción 3'];
  estadoActual = 0;

  toggleState() {
    this.estadoActual = (this.estadoActual + 1) % this.estados.length;
  }
}
