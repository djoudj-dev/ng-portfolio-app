import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestingModule } from '@core/testing/testing.module';

import { HomeBadge } from './home-badge';

describe('HomeBadge', () => {
  let component: HomeBadge;
  let fixture: ComponentFixture<HomeBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeBadge, TestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeBadge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
