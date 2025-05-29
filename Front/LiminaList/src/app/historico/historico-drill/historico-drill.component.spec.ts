import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoDrillComponent } from './historico-drill.component';

describe('HistoricoDrillComponent', () => {
  let component: HistoricoDrillComponent;
  let fixture: ComponentFixture<HistoricoDrillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoricoDrillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricoDrillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
