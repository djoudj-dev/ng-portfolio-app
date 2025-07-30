import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavMobile } from './nav-mobile';

describe('NavMobile', () => {
  let component: NavMobile;
  let fixture: ComponentFixture<NavMobile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavMobile],
    }).compileComponents();

    fixture = TestBed.createComponent(NavMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle menu visibility', () => {
    expect(component.isMenuOpen()).toBe(false);

    component.toggleMenu();
    expect(component.isMenuOpen()).toBe(true);

    component.toggleMenu();
    expect(component.isMenuOpen()).toBe(false);
  });

  it('should close menu', () => {
    component.isMenuOpen.set(true);
    expect(component.isMenuOpen()).toBe(true);

    component.closeMenu();
    expect(component.isMenuOpen()).toBe(false);
  });

  it('should have navigation items', () => {
    expect(component.navigationItems).toBeDefined();
    expect(component.navigationItems.length).toBeGreaterThan(0);
  });
});
