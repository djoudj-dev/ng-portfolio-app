import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BadgeService } from '../services/badge-service';
import { Badge, BadgeStatus, UpdateBadgeRequest } from '../models/badge.model';
import { ToastService } from '@shared/ui/toast/service/toast-service';

@Component({
  selector: 'app-badge-edit-admin',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-text">Modifier le badge</h1>
          <p class="text-text/60 mt-2">Modifier les paramètres de votre badge de compétences</p>
        </div>
        <button
          (click)="goBack()"
          class="bg-secondary hover:bg-accent text-text px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          ← Retour à la liste
        </button>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      } @else {
        <!-- Formulaire -->
        <div class="bg-background shadow rounded-lg border border-accent">
          <div class="p-6">
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- ID du badge (lecture seule) -->
              <div>
                <label class="block text-sm font-medium text-text mb-2">ID du badge</label>
                <input
                  type="text"
                  [value]="badgeId()"
                  readonly
                  class="w-full px-3 py-2 border border-accent rounded-md bg-secondary text-text cursor-not-allowed"
                />
                <p class="text-xs text-text/60 mt-1">L'ID ne peut pas être modifié</p>
              </div>

              <!-- Statut -->
              <div>
                <label for="status" class="block text-sm font-medium text-text mb-2">
                  Statut de disponibilité *
                </label>
                <select
                  id="status"
                  formControlName="status"
                  class="w-full px-3 py-2 border border-accent rounded-md focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-text"
                >
                  @for (option of statusOptions; track option.value) {
                    <option [value]="option.value">{{ option.label }}</option>
                  }
                </select>
                @if (form.get('status')?.invalid && form.get('status')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Le statut est requis</p>
                }
              </div>

              <!-- Date de disponibilité (conditionnelle) -->
              @if (showAvailableFromField()) {
                <div>
                  <label for="availableFrom" class="block text-sm font-medium text-text mb-2">
                    Date de disponibilité *
                  </label>
                  <input
                    type="datetime-local"
                    id="availableFrom"
                    formControlName="availableFrom"
                    class="w-full px-3 py-2 border border-accent rounded-md focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-text"
                  />
                  @if (form.get('availableFrom')?.invalid && form.get('availableFrom')?.touched) {
                    <p class="mt-1 text-sm text-red-600">La date de disponibilité est requise</p>
                  }
                  <p class="text-xs text-text/60 mt-1">
                    Date à partir de laquelle le badge sera disponible
                  </p>
                </div>
              }

              <!-- Actions -->
              <div class="flex justify-end space-x-3 pt-6 border-t border-accent">
                <button
                  type="button"
                  (click)="goBack()"
                  class="px-6 py-2 border border-accent rounded-md bg-secondary text-text hover:bg-accent transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  [disabled]="form.invalid || isSaving()"
                  class="px-6 py-2 bg-accent hover:bg-accent/80 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSaving() ? 'Enregistrement...' : 'Mettre à jour' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Debug info (si nécessaire) -->
      @if (badge()) {
        <div class="mt-6 bg-secondary rounded-lg p-4">
          <h3 class="text-sm font-medium text-text mb-2">Informations du badge</h3>
          <pre class="text-xs text-text/80">{{ badge() | json }}</pre>
        </div>
      }
    </div>
  `,
})
export class BadgeEditAdmin implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly badgeService = inject(BadgeService);
  private readonly toastService = inject(ToastService);

  readonly badgeId = signal<string | null>(null);
  readonly badge = signal<Badge | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);

  readonly statusOptions = [
    { value: BadgeStatus.AVAILABLE, label: 'Disponible' },
    { value: BadgeStatus.UNAVAILABLE, label: 'Indisponible' },
    { value: BadgeStatus.AVAILABLE_FROM, label: 'Disponible à partir de' },
  ];

  readonly form: FormGroup = this.fb.group({
    badgeId: ['', Validators.required],
    status: [BadgeStatus.AVAILABLE, Validators.required],
    availableFrom: [''],
  });

  readonly showAvailableFromField = signal(false);

  ngOnInit(): void {
    // Récupérer l'ID depuis les paramètres de route
    const id = this.route.snapshot.params['id'];

    if (id) {
      this.badgeId.set(id);
      this.loadBadge(id);
      // Retirer le contrôle badgeId du formulaire
      this.form.removeControl('badgeId');
    } else {
      // Si pas d'ID, rediriger vers la liste
      this.goBack();
      return;
    }

    this.setupFormValidation();
  }

  private setupFormValidation(): void {
    this.form.get('status')?.valueChanges.subscribe((status) => {
      const shouldShowDateField = status === BadgeStatus.AVAILABLE_FROM;
      this.showAvailableFromField.set(shouldShowDateField);

      const availableFromControl = this.form.get('availableFrom');

      if (shouldShowDateField) {
        availableFromControl?.setValidators([Validators.required]);
      } else {
        availableFromControl?.clearValidators();
        availableFromControl?.setValue('');
      }

      availableFromControl?.updateValueAndValidity();
    });
  }

  private loadBadge(id: string): void {
    this.isLoading.set(true);

    console.log('Chargement du badge:', id);

    this.badgeService.findOne(id).subscribe({
      next: (badge) => {
        console.log('Badge chargé:', badge);
        this.badge.set(badge);
        this.updateForm(badge);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.toastService.danger(
          'Erreur de chargement',
          error.message ?? 'Impossible de charger le badge',
        );
        this.isLoading.set(false);
        // Rediriger vers la liste en cas d'erreur
        this.goBack();
      },
    });
  }

  private updateForm(badge: Badge): void {
    this.form.patchValue({
      status: badge.status,
      availableFrom: badge.availableFrom
        ? new Date(badge.availableFrom).toISOString().slice(0, 16)
        : '',
    });

    // Déclencher la validation du statut pour afficher/masquer le champ date
    const status = badge.status;
    this.showAvailableFromField.set(status === BadgeStatus.AVAILABLE_FROM);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      console.log('Formulaire invalide:', this.form.errors);
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    console.log('Valeurs du formulaire:', formValue);

    const updateRequest: UpdateBadgeRequest = {
      status: formValue.status,
      availableFrom: formValue.availableFrom ?? undefined,
    };

    console.log('Envoi de la mise à jour:', updateRequest);

    this.badgeService.update(this.badgeId()!, updateRequest).subscribe({
      next: (badge) => {
        console.log('Badge mis à jour:', badge);
        this.badge.set(badge);
        this.isSaving.set(false);

        // Toast de succès
        this.toastService.success(
          'Badge mis à jour',
          `Le statut du badge a été modifié avec succès`,
        );

        // Recharger les badges dans le service pour mettre à jour la liste
        this.badgeService.loadBadges();

        // Retour à la liste avec un petit délai pour voir le toast
        setTimeout(() => {
          this.goBack();
        }, 1000);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.isSaving.set(false);

        // Toast d'erreur
        this.toastService.danger(
          'Erreur de mise à jour',
          error.message ?? 'Impossible de mettre à jour le badge',
        );
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/badges']);
  }
}
