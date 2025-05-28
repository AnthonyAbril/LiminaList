// src/app/services/asignacion-overlay.service.ts
import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { AsignaTareaComponent } from '../asigna-tarea/asigna-tarea.component';

@Injectable({ providedIn: 'root' })
export class AsignacionOverlayService {
  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay, private injector: Injector) {}

  abrirAsignador(
    id: number,
    nombre: string,
    onGuardarFecha: (fechas: string) => void,
    onGuardarHora: (hora: string) => void
  ) {
    if (this.overlayRef) {
      this.cerrarAsignador();
    }

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      panelClass: 'overlay-padre',           // ← lo añadimos aquí
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    const injector = Injector.create({
      providers: [
        { provide: 'ASIGNACION_ID', useValue: id },
        { provide: 'ASIGNACION_NOMBRE', useValue: nombre }
      ],
      parent: this.injector
    });

    const portal = new ComponentPortal(AsignaTareaComponent, null, injector);
    const componentRef = this.overlayRef.attach(portal);

    // 🔁 Manejar eventos del componente emergente
    componentRef.instance.fechaSeleccionada.subscribe((data: string) => {
      onGuardarFecha(data);
    });

    componentRef.instance.horaSeleccionada.subscribe((hora: string) => {
      onGuardarHora(hora);
    });

    componentRef.instance.cerrarVentana.subscribe(() => {
      this.cerrarAsignador();
    });
  }


  cerrarAsignador() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
