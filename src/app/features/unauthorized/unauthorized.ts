import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="error-code">403</div>
        <h1>Accès non autorisé</h1>
        <p>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div class="actions">
          <button class="btn primary" (click)="goHome()">
            Retour à l'accueil
          </button>
          <button class="btn secondary" (click)="goBack()">
            Retour
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
      padding: 2rem;
    }

    .unauthorized-content {
      text-align: center;
      max-width: 600px;
    }

    .error-code {
      font-size: 8rem;
      font-weight: bold;
      color: #dc3545;
      margin-bottom: 1rem;
      line-height: 1;
    }

    h1 {
      font-size: 2.5rem;
      color: #343a40;
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.25rem;
      color: #6c757d;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      min-width: 150px;
    }

    .btn.primary {
      background-color: #007bff;
      color: white;
    }

    .btn.primary:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
    }

    .btn.secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn.secondary:hover {
      background-color: #545b62;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .error-code {
        font-size: 4rem;
      }

      h1 {
        font-size: 1.75rem;
      }

      p {
        font-size: 1rem;
      }

      .actions {
        flex-direction: column;
        align-items: center;
      }

      .btn {
        width: 100%;
        max-width: 200px;
      }
    }
  `]
})
export class UnauthorizedComponent {
  private readonly router = inject(Router);

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }
}
