import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeLaptop } from './home-laptop';

describe('HomeLaptop', () => {
  let component: HomeLaptop;
  let fixture: ComponentFixture<HomeLaptop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeLaptop]
    })
    

    fixture = TestBed.createComponent(HomeLaptop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
