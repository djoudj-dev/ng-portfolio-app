import { Component, signal, viewChild, inject } from '@angular/core';
import { LoginModal, NavbarComponent, ToastContainer, ToastService } from '@shared/ui';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, LoginModal, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(keydown.control.alt.l)': 'onKeyboardShortcut($event)',
    'tabindex': '0',
  },
})
export class App {
  private readonly toastService = inject(ToastService);

  protected readonly title = signal('ng-portfolio-app');

  readonly loginModal = viewChild<LoginModal>('loginModal');

  onShowLogin(): void {
    this.loginModal()?.show();
  }

  onKeyboardShortcut(event: Event): void {
    // Prevent default browser behavior for Ctrl+Alt+L
    event.preventDefault();
    // Open login modal
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
