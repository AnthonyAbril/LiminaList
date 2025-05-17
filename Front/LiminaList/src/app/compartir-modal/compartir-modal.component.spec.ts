import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompartirModalComponent } from './compartir-modal.component';

describe('CompartirModalComponent', () => {
  let component: CompartirModalComponent;
  let fixture: ComponentFixture<CompartirModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompartirModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompartirModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
