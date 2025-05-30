import { TestBed } from '@angular/core/testing';

import { RelojSyncService } from './reloj-sync.service';

describe('RelojSyncService', () => {
  let service: RelojSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelojSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
