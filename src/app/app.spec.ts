import { TestBed } from "@angular/core/testing";
import { App } from "./app";
import { RouterModule } from "@angular/router";

describe("App", () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [App, RouterModule],
    });
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it("should render navbar and router outlet", () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector("app-navbar")).toBeTruthy();
    expect(compiled.querySelector("router-outlet")).toBeTruthy();
  });
});
