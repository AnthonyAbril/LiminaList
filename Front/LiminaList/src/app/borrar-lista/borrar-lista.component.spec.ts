import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrarListaComponent } from './borrar-lista.component';

describe('BorrarListaComponent', () => {
  let component: BorrarListaComponent;
  let fixture: ComponentFixture<BorrarListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BorrarListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BorrarListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
