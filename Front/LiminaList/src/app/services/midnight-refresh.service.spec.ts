import { TestBed } from '@angular/core/testing';

import { MidnightRefreshService } from './midnight-refresh.service';

describe('MidnightRefreshService', () => {
  let service: MidnightRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MidnightRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
