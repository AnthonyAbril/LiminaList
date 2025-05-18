// src/app/compartir-modal/compartir-modal.component.ts
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import QRCodeStyling from 'qr-code-styling';

@Component({
  selector: 'app-compartir-modal',
  standalone: true,
  imports: [],
  template: `
    <div class="manto">
      <div class="modal-container">
        <h2>Compartir Lista</h2>
        
        <div #qrCodeRef class="qr-wrapper"></div>

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
export class CompartirModalComponent implements AfterViewInit, OnChanges {
  @Input() listaId = '';
  @Output() cerrar = new EventEmitter<void>();
  @ViewChild('qrCodeRef', { static: false }) qrCodeRef!: ElementRef;

  qrCode!: QRCodeStyling;

  get listaUrl(): string {
    const base = "http://localhost:4200"; // Cambiar a producción si es necesario
    return `${base}/panel/${this.listaId}`;
  }

  ngAfterViewInit() {
    this.generarQr();
  }

  ngOnChanges() {
    if (this.qrCode) {
      this.qrCode.update({
        data: this.listaUrl
      });
    }
  }

  generarQr() {
    this.qrCode = new QRCodeStyling({
      width: 200,
      height: 200,
      data: this.listaUrl,
      image: "assets/icons/logo.svg", // ✅ Ruta a tu logo aquí
      imageOptions: {
        crossOrigin: "anonymous",
        imageSize: 0.4,   // 40% del QR
        margin: 5
      },
      dotsOptions: {
        type: "rounded",
        color: "#000000"
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#000000"
      },
      backgroundOptions: {
        color: "#ffffff"
      },
      qrOptions: {
        errorCorrectionLevel: "H"  // Nivel más alto (30%)
      },
    });

    this.qrCode.append(this.qrCodeRef.nativeElement);
  }

  copiarUrl() {
    navigator.clipboard.writeText(this.listaUrl)
      .then(() => alert('✅ Enlace copiado al portapapeles!'));
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
