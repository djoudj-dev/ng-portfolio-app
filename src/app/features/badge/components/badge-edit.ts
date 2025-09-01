import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Badge, BadgeStatus, UpdateBadgeRequest } from '../models/badge.model';
import { BadgeService } from '../services/badge-service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-badge-edit',
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-background py-8">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-background shadow-lg rounded-lg p-6 border border-accent">
          <!-- Header -->
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-text">
              {{ badge() ? 'Modifier le statut du badge' : 'Gestion du badge' }}
            </h1>
            <p class="text-secondary mt-2">Gérez la disponibilité de votre badge professionnel</p>
          </div>

          @if (isLoading()) {
            <div class="text-center py-8">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"
              ></div>
              <p class="text-gray-600 mt-2">Chargement...</p>
            </div>
          } @else if (error()) {
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p class="text-red-600">{{ error() }}</p>
            </div>
          } @else {
            <!-- Formulaire -->
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Statut -->
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700">
                  Statut de disponibilité *
                </label>
                <select
                  id="status"
                  formControlName="status"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  <label for="availableFrom" class="block text-sm font-medium text-gray-700">
                    Date de disponibilité *
                  </label>
                  <input
                    type="datetime-local"
                    id="availableFrom"
                    formControlName="availableFrom"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  @if (form.get('availableFrom')?.invalid && form.get('availableFrom')?.touched) {
                    <p class="mt-1 text-sm text-red-600">La date de disponibilité est requise</p>
                  }
                </div>
              }

              <!-- Actions -->
              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  (click)="onCancelClick()"
                  class="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  [disabled]="form.invalid || isSaving()"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {{ isSaving() ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          }
        </div>
      </div>
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

  readonly showAvailableFromField = computed(() => {
    const status = this.form.get('status')?.value;
    return status === BadgeStatus.UNAVAILABLE || status === BadgeStatus.AVAILABLE_FROM;
  });

  ngOnInit(): void {
    this.initializeForm();
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
    }
  }

  private setupFormValidation(): void {
    this.form.get('status')?.valueChanges.subscribe((status) => {
      const availableFromControl = this.form.get('availableFrom');

      if (status === BadgeStatus.UNAVAILABLE || status === BadgeStatus.AVAILABLE_FROM) {
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
        availableFrom: formValue.availableFrom ?? undefined,
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
