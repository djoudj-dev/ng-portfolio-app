import { Component, signal } from '@angular/core';
import { NavbarComponent } from '@shared/ui/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('ng-portfolio-app');
}
