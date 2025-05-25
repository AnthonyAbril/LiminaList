import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignaTareaComponent } from './asigna-tarea.component';

describe('AsignaTareaComponent', () => {
  let component: AsignaTareaComponent;
  let fixture: ComponentFixture<AsignaTareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignaTareaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignaTareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
