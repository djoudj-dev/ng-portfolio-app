import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonDarkMode } from './button-dark-mode';

describe('ButtonDarkMode', () => {
  let component: ButtonDarkMode;
  let fixture: ComponentFixture<ButtonDarkMode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonDarkMode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonDarkMode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
