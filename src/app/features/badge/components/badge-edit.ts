import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Badge, BadgeStatus, UpdateBadgeRequest } from '../models/badge.model';
import { BadgeService } from '../services/badge-service';
import { AuthService } from '@core/services/auth';

@Component({
  selector: 'app-badge-edit',
  imports: [ReactiveFormsModule, CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="bg-background p-3 sm:p-6 lg:p-8 rounded-lg shadow-md shadow-accent border border-primary-300 max-w-4xl mx-auto"
    >
      @if (isLoading()) {
        <!-- État de chargement amélioré -->
        <div class="flex flex-col items-center justify-center py-16 space-y-6">
          <div class="relative">
            <div
              class="animate-spin rounded-full h-16 w-16 border-4 border-accent/20 border-t-accent"
            ></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-2xl">🏷️</span>
            </div>
          </div>
          <div class="text-center space-y-2">
            <h3 class="text-lg font-semibold text-text">Chargement du badge</h3>
            <p class="text-text/60">Récupération de vos informations...</p>
          </div>
        </div>
      } @else if (error()) {
        <!-- Message d'erreur amélioré -->
        <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div
              class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <span class="text-red-600 text-xl">⚠️</span>
            </div>
            <div class="flex-1">
              <h3 class="text-red-800 font-semibold mb-1">Erreur de chargement</h3>
              <p class="text-red-700">{{ error() }}</p>
            </div>
            <button
              type="button"
              (click)="ngOnInit()"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Réessayer
            </button>
          </div>
        </div>
      } @else {
        <!-- Header avec indicateurs -->
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-primary-300/30"
        >
          <div class="flex items-center gap-4 mb-4 sm:mb-0">
            <div
              class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center"
            >
              <span class="text-2xl sm:text-3xl">🏷️</span>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-text">
                {{ badge() ? '✏️ Modifier le badge' : '🚀 Nouveau badge' }}
              </h2>
              <p class="text-text/70 text-sm sm:text-base mt-1">
                Gérez votre statut de disponibilité professionnelle
              </p>
            </div>
          </div>

          <!-- Indicateur de statut actuel -->
          @if (badge()) {
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg {{ getStatusBadgeClass() }}">
              <div class="w-2 h-2 rounded-full {{ getStatusDotClass() }}"></div>
              <span class="text-sm font-medium">{{ getCurrentStatusLabel() }}</span>
            </div>
          }
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 sm:space-y-8">
          <!-- Section 1: Configuration du statut -->
          <div class="bg-background-100 p-4 sm:p-6 rounded-lg border border-primary-300/30">
            <h3 class="text-lg font-semibold text-text mb-4 flex items-center">
              📋 Configuration du statut
            </h3>

            <div class="space-y-4">
              <label for="status" class="flex items-center text-sm font-medium text-text/90 mb-2">
                <div class="w-2 h-2 bg-accent rounded-full mr-2"></div>
                Statut de disponibilité
              </label>

              <div class="relative">
                <select
                  id="status"
                  formControlName="status"
                  class="w-full px-4 py-3 bg-background-200 border border-primary-300 rounded-lg text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all duration-200 text-base appearance-none cursor-pointer"
                >
                  @for (option of statusOptions; track option.value) {
                    <option [value]="option.value" class="bg-background-200 text-text">
                      {{ option.icon }} {{ option.label }}
                    </option>
                  }
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <div class="w-5 h-5 text-text/50">
                    <img
                      [ngSrc]="'/icons/arrow-b.svg'"
                      alt=""
                      class="w-full h-full"
                      height="24"
                      width="24"
                    />
                  </div>
                </div>
              </div>

              @if (form.get('status')?.invalid && form.get('status')?.touched) {
                <div class="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <span class="text-red-600">⚠️</span>
                  <span>Le statut est requis</span>
                </div>
              }

              <!-- Guide des statuts -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div class="text-green-600 text-lg mb-1">✅</div>
                  <div class="text-xs text-green-700 font-medium">Disponible</div>
                  <div class="text-xs text-green-600">Prêt pour nouveaux projets</div>
                </div>
                <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div class="text-red-600 text-lg mb-1">❌</div>
                  <div class="text-xs text-red-700 font-medium">Indisponible</div>
                  <div class="text-xs text-red-600">Pas de nouveaux projets</div>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div class="text-blue-600 text-lg mb-1">📅</div>
                  <div class="text-xs text-blue-700 font-medium">Disponible le</div>
                  <div class="text-xs text-blue-600">À partir d'une date</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Date de disponibilité (conditionnelle) -->
          @if (showAvailableFromField()) {
            <div
              class="bg-background-100 p-4 sm:p-6 rounded-lg border border-primary-300/30 animate-in slide-in-from-top duration-300"
            >
              <h3 class="text-lg font-semibold text-text mb-4 flex items-center">
                📅 Planification de la disponibilité
              </h3>

              <div class="space-y-4">
                <label
                  for="availableFrom"
                  class="flex items-center text-sm font-medium text-text/90 mb-2"
                >
                  <div class="w-2 h-2 bg-accent rounded-full mr-2"></div>
                  Date et heure de disponibilité
                </label>

                <div class="relative">
                  <input
                    type="datetime-local"
                    id="availableFrom"
                    formControlName="availableFrom"
                    class="w-full px-4 py-3 bg-background-200 border border-primary-300 rounded-lg text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all duration-200 text-base"
                  />
                  <div class="absolute inset-y-0 right-12 flex items-center pointer-events-none">
                    <div class="w-5 h-5 text-text/50">📅</div>
                  </div>
                </div>

                @if (form.get('availableFrom')?.invalid && form.get('availableFrom')?.touched) {
                  <div
                    class="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"
                  >
                    <span class="text-red-600">⚠️</span>
                    <span>La date de disponibilité est requise</span>
                  </div>
                }

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div class="flex items-start gap-3">
                    <span class="text-blue-600 text-lg mt-0.5">💡</span>
                    <div class="text-sm text-blue-700">
                      <p class="font-medium mb-1">Information importante</p>
                      <p>
                        Sélectionnez la date et l'heure précises à partir desquelles vous serez
                        disponible pour de nouveaux projets. Cette information sera affichée aux
                        visiteurs de votre portfolio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Section d'actions - Mobile friendly -->
          <div
            class="sticky bottom-0 -mx-3 sm:-mx-6 lg:-mx-8 mt-8 p-4 sm:p-6 bg-gradient-to-r from-background via-background to-background border-t border-primary-300/30 rounded-b-lg"
          >
            <div
              class="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between sm:items-center"
            >
              <!-- Indicateurs de validation -->
              <div class="flex flex-col sm:flex-row gap-2 text-sm">
                <div class="flex items-center space-x-2">
                  <div
                    class="w-2 h-2 {{
                      form.get('status')?.valid ? 'bg-green-500' : 'bg-red-500'
                    }} rounded-full"
                  ></div>
                  <span class="text-text/70">Statut</span>
                </div>
                @if (showAvailableFromField()) {
                  <div class="flex items-center space-x-2">
                    <div
                      class="w-2 h-2 {{
                        form.get('availableFrom')?.valid ? 'bg-green-500' : 'bg-red-500'
                      }} rounded-full"
                    ></div>
                    <span class="text-text/70">Date</span>
                  </div>
                }
              </div>

              <!-- Boutons d'action -->
              <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  (click)="resetForm()"
                  class="px-6 py-3 border border-primary-300 rounded-lg text-text hover:bg-background-200 transition-all duration-200 text-center"
                >
                  🔄 Réinitialiser
                </button>
                <button
                  type="button"
                  (click)="onCancelClick()"
                  class="px-6 py-3 border border-accent/30 rounded-lg bg-background text-text font-medium hover:bg-accent/5 hover:border-accent/40 transition-all duration-200"
                >
                  ❌ Annuler
                </button>
                <button
                  type="submit"
                  [disabled]="form.invalid || isSaving()"
                  class="px-8 py-3 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:transform-none"
                  [class.opacity-50]="form.invalid || isSaving()"
                >
                  <div class="flex items-center justify-center gap-2">
                    @if (isSaving()) {
                      <div
                        class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                      ></div>
                      <span>Enregistrement...</span>
                    } @else {
                      <span>💾</span>
                      <span>{{ badge() ? 'Mettre à jour' : 'Créer le badge' }}</span>
                    }
                  </div>
                </button>
              </div>
            </div>

            <!-- Aide contextuelle -->
            @if (!form.valid) {
              <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-start space-x-2">
                  <span class="text-red-500 mt-0.5">⚠️</span>
                  <div class="text-sm text-red-700">
                    <p class="font-medium mb-1">Formulaire incomplet</p>
                    <ul class="text-xs space-y-1">
                      @if (form.get('status')?.invalid) {
                        <li>• Le statut est requis</li>
                      }
                      @if (form.get('availableFrom')?.invalid && showAvailableFromField()) {
                        <li>• La date de disponibilité est requise</li>
                      }
                    </ul>
                  </div>
                </div>
              </div>
            }
          </div>
        </form>
      }
    </section>
  `,
})
export class BadgeEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly badgeService = inject(BadgeService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly badgeId = input<string>('');
  readonly save = output<Badge>();
  readonly cancelled = output<void>();

  readonly badge = signal<Badge | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);

  readonly statusOptions = [
    { value: BadgeStatus.AVAILABLE, label: 'Disponible', icon: '✅' },
    { value: BadgeStatus.UNAVAILABLE, label: 'Indisponible', icon: '❌' },
    { value: BadgeStatus.AVAILABLE_FROM, label: 'Disponible à partir de', icon: '📅' },
  ];

  readonly form: FormGroup = this.fb.group({
    status: [BadgeStatus.AVAILABLE, Validators.required],
    availableFrom: [''],
  });

  readonly showAvailableFromField = signal(false);

  ngOnInit(): void {
    this.setupFormValidation();

    const id = this.route.snapshot.params['id'] ?? this.badgeId();
    if (id) {
      this.loadBadge(id);
    } else {
      this.loadFirstBadge();
    }
  }

  private initializeForm(): void {
    if (this.badge()) {
      const badge = this.badge()!;
      this.form.patchValue({
        status: badge.status,
        availableFrom: badge.availableFrom
          ? new Date(badge.availableFrom).toISOString().slice(0, 16)
          : '',
      });

      this.showAvailableFromField.set(badge.status === BadgeStatus.AVAILABLE_FROM);
    }
  }

  private setupFormValidation(): void {
    this.form.get('status')?.valueChanges.subscribe((status) => {
      const availableFromControl = this.form.get('availableFrom');
      const shouldShowField = status === BadgeStatus.AVAILABLE_FROM;

      this.showAvailableFromField.set(shouldShowField);

      if (shouldShowField) {
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
    this.error.set(null);

    this.badgeService.findOne(id).subscribe({
      next: (badge) => {
        this.badge.set(badge);
        this.initializeForm();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  private loadFirstBadge(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.badgeService.findAll().subscribe({
      next: (badges) => {
        if (badges.length > 0) {
          this.badge.set(badges[0]);
          this.initializeForm();
        } else {
          this.badge.set({
            id: 'default',
            status: BadgeStatus.AVAILABLE,
            availableFrom: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          this.initializeForm();
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.valid && this.badge()) {
      this.isSaving.set(true);
      this.error.set(null);

      const formValue = this.form.value;
      const request: UpdateBadgeRequest = {
        status: formValue.status,
        availableFrom:
          formValue.availableFrom && formValue.availableFrom.trim() !== ''
            ? formValue.availableFrom
            : undefined,
      };

      this.badgeService.update(this.badge()!.id, request).subscribe({
        next: (badge) => {
          this.badge.set(badge);
          this.save.emit(badge);
          this.isSaving.set(false);
        },
        error: (error) => {
          this.error.set(error.message);
          this.isSaving.set(false);
        },
      });
    }
  }

  onCancelClick(): void {
    this.cancelled.emit();
  }

  resetForm(): void {
    this.form.reset({
      status: BadgeStatus.AVAILABLE,
      availableFrom: '',
    });
    this.error.set(null);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getStatusBadgeClass(): string {
    const badge = this.badge();
    if (!badge) return 'bg-gray-100 text-gray-600';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'bg-green-100 text-green-700 border border-green-200';
      case BadgeStatus.UNAVAILABLE:
        return 'bg-red-100 text-red-700 border border-red-200';
      case BadgeStatus.AVAILABLE_FROM:
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusDotClass(): string {
    const badge = this.badge();
    if (!badge) return 'bg-gray-400';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'bg-green-500';
      case BadgeStatus.UNAVAILABLE:
        return 'bg-red-500';
      case BadgeStatus.AVAILABLE_FROM:
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  }

  getCurrentStatusLabel(): string {
    const badge = this.badge();
    if (!badge) return 'Statut non défini';

    const option = this.statusOptions.find((opt) => opt.value === badge.status);
    return option ? `${option.icon} ${option.label}` : 'Statut inconnu';
  }
}
