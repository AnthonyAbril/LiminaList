import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TareaHistoricoComponent } from './tarea-historico.component';

describe('TareaHistoricoComponent', () => {
  let component: TareaHistoricoComponent;
  let fixture: ComponentFixture<TareaHistoricoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TareaHistoricoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TareaHistoricoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
