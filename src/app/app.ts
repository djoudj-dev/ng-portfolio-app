import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { Navbar } from "@shared/ui/navbar/navbar";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter, delay } from "rxjs/operators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ScrollService } from "@core/services/scroll-service";
import { ToastComponent } from "@shared/ui/toast/toast";

@Component({
  selector: "app-root",
  imports: [Navbar, ToastComponent, RouterOutlet],
  templateUrl: "./app.html",
})
export class App implements OnInit {
  protected readonly title = signal("ng-portfolio-app");

  private readonly router = inject(Router);
  private readonly scrollService = inject(ScrollService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        delay(0), // Ensure view is rendered before scrolling
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event: NavigationEnd) => {
        const urlTree = this.router.parseUrl(event.urlAfterRedirects);
        const fragment = urlTree.fragment;

        this.scrollService.scrollToSection(fragment);
      });
  }
}
