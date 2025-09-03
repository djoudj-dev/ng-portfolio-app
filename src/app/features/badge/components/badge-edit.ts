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
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Badge, BadgeStatus, UpdateBadgeRequest } from '../models/badge.model';
import { BadgeService } from '../services/badge-service';
import { AuthService } from '@core/services/auth';

@Component({
  selector: 'app-badge-edit',
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <div class="text-center space-y-4">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p class="text-secondary font-medium">Chargement du badge...</p>
          </div>
        </div>
      } @else if (error()) {
        <div class="bg-red/5 border border-red/20 rounded-xl p-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-5 h-5 bg-red/20 rounded-full flex items-center justify-center">
              <span class="text-red text-xs">⚠</span>
            </div>
            <p class="text-red font-medium">{{ error() }}</p>
          </div>
        </div>
      } @else {
        <!-- Enhanced Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-8">
          <!-- Form Header -->
          <div class="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-accent/20">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <span class="text-2xl">🏷️</span>
              </div>
              <div>
                <h2 class="text-xl font-bold text-text">
                  {{ badge() ? 'Modifier le statut du badge' : 'Configuration du badge' }}
                </h2>
                <p class="text-secondary text-sm mt-1">
                  Définissez votre disponibilité professionnelle
                </p>
              </div>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="bg-background rounded-xl border border-accent/20 p-6 space-y-6">
            <!-- Status Field -->
            <div class="space-y-3">
              <label for="status" class="block text-sm font-semibold text-text">
                Statut de disponibilité
                <span class="text-red ml-1">*</span>
              </label>
              <div class="relative">
                <select
                  id="status"
                  formControlName="status"
                  class="w-full px-4 py-3 border border-accent/30 rounded-xl bg-background text-text focus:ring-2 focus:ring-primary focus:border-primary/30 transition-all duration-200 appearance-none cursor-pointer"
                >
                  @for (option of statusOptions; track option.value) {
                    <option [value]="option.value" class="bg-background text-text">{{ option.label }}</option>
                  }
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              @if (form.get('status')?.invalid && form.get('status')?.touched) {
                <div class="flex items-center gap-2 text-red text-sm">
                  <span class="text-xs">⚠</span>
                  <span>Le statut est requis</span>
                </div>
              }
            </div>

            <!-- Available From Field (Conditional) -->
            @if (showAvailableFromField()) {
              <div class="space-y-3 animate-in fade-in duration-300">
                <label for="availableFrom" class="block text-sm font-semibold text-text">
                  Date de disponibilité
                  <span class="text-red ml-1">*</span>
                </label>
                <div class="relative">
                  <input
                    type="datetime-local"
                    id="availableFrom"
                    formControlName="availableFrom"
                    class="w-full px-4 py-3 border border-accent/30 rounded-xl bg-background text-text focus:ring-2 focus:ring-primary focus:border-primary/30 transition-all duration-200"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                @if (form.get('availableFrom')?.invalid && form.get('availableFrom')?.touched) {
                  <div class="flex items-center gap-2 text-red text-sm">
                    <span class="text-xs">⚠</span>
                    <span>La date de disponibilité est requise</span>
                  </div>
                }
                <p class="text-secondary text-xs">
                  💡 Sélectionnez la date et l'heure à partir desquelles vous serez disponible
                </p>
              </div>
            }
          </div>

          <!-- Form Actions -->
          <div class="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              (click)="onCancelClick()"
              class="px-6 py-3 border border-accent/30 rounded-xl bg-background text-text font-medium hover:bg-accent/5 hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              [disabled]="form.invalid || isSaving()"
              class="px-6 py-3 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
              [class.opacity-50]="form.invalid || isSaving()"
            >
              <div class="flex items-center justify-center gap-2">
                @if (isSaving()) {
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enregistrement...</span>
                } @else {
                  <span>💾</span>
                  <span>Enregistrer</span>
                }
              </div>
            </button>
          </div>
        </form>
      }
    </div>
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
    { value: BadgeStatus.AVAILABLE, label: 'Disponible' },
    { value: BadgeStatus.UNAVAILABLE, label: 'Indisponible' },
    { value: BadgeStatus.AVAILABLE_FROM, label: 'Disponible à partir de' },
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
      // Load the first available badge or create a default one
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

      // Initialize signal based on current status
      this.showAvailableFromField.set(badge.status === BadgeStatus.AVAILABLE_FROM);
    }
  }

  private setupFormValidation(): void {
    this.form.get('status')?.valueChanges.subscribe((status) => {
      const availableFromControl = this.form.get('availableFrom');
      const shouldShowField = status === BadgeStatus.AVAILABLE_FROM;

      // Update signal for template reactivity
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
          // If no badges exist, create a default badge state
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
        availableFrom: formValue.availableFrom && formValue.availableFrom.trim() !== ''
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
}
