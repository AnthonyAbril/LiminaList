import { TestBed } from '@angular/core/testing';

import { AsignacionOverlayService } from './asignacion-overlay.service';

describe('AsignacionOverlayService', () => {
  let service: AsignacionOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsignacionOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
