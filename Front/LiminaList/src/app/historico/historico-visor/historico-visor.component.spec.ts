import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoVisorComponent } from './historico-visor.component';

describe('HistoricoVisorComponent', () => {
  let component: HistoricoVisorComponent;
  let fixture: ComponentFixture<HistoricoVisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoricoVisorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricoVisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
