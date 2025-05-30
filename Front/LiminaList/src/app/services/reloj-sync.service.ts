import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RelojSyncService {
  private tareasActualizadasSource = new Subject<void>();
  tareasActualizadas$ = this.tareasActualizadasSource.asObservable();

  emitirActualizacion(): void {
    this.tareasActualizadasSource.next();
  }
}
