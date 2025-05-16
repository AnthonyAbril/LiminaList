import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaVisorComponent } from './lista-visor.component';

describe('ListaVisorComponent', () => {
  let component: ListaVisorComponent;
  let fixture: ComponentFixture<ListaVisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListaVisorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaVisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
