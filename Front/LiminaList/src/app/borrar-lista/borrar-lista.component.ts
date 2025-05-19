import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ListasService } from '../services/listas.service';

@Component({
  selector: 'app-borrar-lista',
  standalone: true,
  template: `
    <div class="manto">
      <div class="modal-container">
        <h2>Eliminar Lista</h2>
        <p>¿Seguro que quieres eliminar esta lista?</p>
        <div class="botones">
          <button (click)="confirmarBorrado()">Borrar</button>
          <button (click)="cerrarModal()">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./borrar-lista.component.css']
})
export class BorrarListaComponent {
  @Input() listaId = '';
  @Output() cerrar = new EventEmitter<void>();
  @Output() listaBorrada = new EventEmitter<void>();

  constructor(private listasService: ListasService) {}

  cerrarModal() {
    this.cerrar.emit();
  }

  confirmarBorrado() {
    this.listasService.borrarLista(this.listaId).subscribe(() => {
      this.listaBorrada.emit();
    });
  }
}
