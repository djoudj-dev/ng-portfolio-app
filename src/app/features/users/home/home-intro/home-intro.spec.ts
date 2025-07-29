import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeIntro } from './home-intro';

describe('HomeIntro', () => {
  let component: HomeIntro;
  let fixture: ComponentFixture<HomeIntro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeIntro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeIntro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
