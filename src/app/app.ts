import { Component, signal, viewChild, inject, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { LoginModal, NavbarComponent, ToastContainer, ToastService } from '@shared/ui';
import { FooterComponent } from '@shared/ui/footer/footer.component';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, LoginModal, ToastContainer, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css', './shared/animations/route-animations.css'],
  host: {
    '(keydown.control.alt.l)': 'onKeyboardShortcut($event)',
    tabindex: '0',
  },
})
export class App {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url),
    ),
    { initialValue: this.router.url },
  );

  readonly showFooter = computed(() => {
    const url = this.currentUrl();
    return url === '/contact';
  });

  protected readonly title = signal('ng-portfolio-app');
  readonly loginModal = viewChild<LoginModal>('loginModal');

  onShowLogin(): void {
    this.loginModal()?.show();
  }

  onKeyboardShortcut(event: Event): void {
    event.preventDefault();
    this.onShowLogin();
  }

  onLoginCompleted(): void {
    this.toastService.success('Connexion réussie', 'Vous êtes maintenant connecté à votre compte.');
  }

  onLogoutCompleted(): void {
    this.toastService.success('Déconnexion réussie', 'Vous avez été déconnecté avec succès.');
  }

  onModalClosed(): void {}
}
