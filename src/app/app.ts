import { Component, signal, viewChild, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginModal, NavbarComponent, ToastContainer, ToastService } from '@shared/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, LoginModal, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(keydown.control.alt.l)': 'onKeyboardShortcut($event)',
    tabindex: '0',
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
