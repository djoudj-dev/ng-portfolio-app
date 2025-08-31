import { Component, signal, viewChild } from '@angular/core';
import { LoginModal, NavbarComponent } from '@shared/ui';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, LoginModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('ng-portfolio-app');

  readonly loginModal = viewChild<LoginModal>('loginModal');

  onShowLogin(): void {
    this.loginModal()?.show();
  }

  onLoginCompleted(): void {
    console.log('Login completed successfully');
  }

  onModalClosed(): void {
    console.log('Login modal closed');
  }
}
