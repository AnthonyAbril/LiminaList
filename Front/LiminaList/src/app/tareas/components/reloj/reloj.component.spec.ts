import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelojComponent } from './reloj.component';

describe('RelojComponent', () => {
  let component: RelojComponent;
  let fixture: ComponentFixture<RelojComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RelojComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelojComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
