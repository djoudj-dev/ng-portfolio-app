import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestingModule } from '@core/testing/testing.module';

import { HomeBanner } from './home-banner';

describe('HomeBanner', () => {
  let component: HomeBanner;
  let fixture: ComponentFixture<HomeBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeBanner, TestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
