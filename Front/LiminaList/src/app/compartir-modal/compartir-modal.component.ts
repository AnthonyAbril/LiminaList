// src/app/compartir-modal/compartir-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';  // ← standalone

@Component({
  selector: 'app-compartir-modal',
  standalone: true,                                // ← Ahora es standalone
  imports: [ QRCodeComponent ],                    // ← Importa directamente el componente QR
  template: `
    <div class="manto">
      <div class="modal-container">
        <h2>Compartir Lista</h2>
        <!-- uso del standalone QRCodeComponent -->
        <div class="qr-wrapper">
          <qrcode
            [qrdata]="listaUrl"
            [width]="200"
            [errorCorrectionLevel]="'M'">
          </qrcode>
        </div>
        <p>{{ listaUrl }}</p>
        <div class="botones">
          <button (click)="copiarUrl()">Copiar enlace</button>
          <button (click)="cerrarModal()">Cerrar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./compartir-modal.component.css']
})
export class CompartirModalComponent {
  @Input() listaId = '';
  @Output() cerrar = new EventEmitter<void>();

  get listaUrl(): string {
    const url = "http://localhost:4200";
    //url = "https://liminalist";
    return url + `/panel/${this.listaId}`;
  }

  copiarUrl() {
    navigator.clipboard.writeText(this.listaUrl)
      .then(() => alert('✅ Enlace copiado al portapapeles!'));
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
