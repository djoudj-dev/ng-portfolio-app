import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SvgIcon } from './icon-svg';

describe('SvgIcon', () => {
  let component: SvgIcon;
  let fixture: ComponentFixture<SvgIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgIcon],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SvgIcon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
