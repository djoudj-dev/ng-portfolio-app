import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ButtonComponent } from '@shared/ui/button/button';
import { ToastService } from '@shared/ui';
import { CvService } from '@features/cv';
import type { CvMetadata } from '@features/cv';

@Component({
  selector: 'app-cv-admin',
  imports: [CommonModule, ButtonComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto p-6 max-w-10xl">
      <div class="bg-background rounded-lg shadow-lg border border-accent">
        <div class="p-6 border-b border-accent bg-gradient-to-r from-accent/100 to-accent/20">
          <h1 class="text-2xl font-bold text-text mb-2">Gestion du CV</h1>
          <p class="text-text">Téléchargez et gérez votre CV professionnel</p>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Section CV Actuel -->
            <div>
              @if (currentCv(); as cv) {
                <div class="bg-background rounded-xl p-6 border border-accent">
                  <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                    <img
                      [ngSrc]="'/icons/cv.svg'"
                      alt="CV"
                      class="w-5 h-5 icon-invert"
                      width="20"
                      height="20"
                    />
                    CV Actuel
                  </h2>
                  <div class="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <span
                        class="text-accent font-semibold underline underline-offset-2 decoration-text"
                        >Nom du fichier :</span
                      >
                      <p class="text-text font-medium">
                        {{ cv.originalName || cv.fileName }}
                      </p>
                    </div>
                    <div>
                      <span
                        class="text-accent font-semibold underline underline-offset-2 decoration-text"
                        >Taille :</span
                      >
                      <p class="text-text font-medium">{{ formatFileSize(cv.fileSize) }}</p>
                    </div>
                    <div>
                      <span
                        class="text-accent font-semibold underline underline-offset-2 decoration-text"
                        >Version :</span
                      >
                      <p class="text-text font-medium">{{ cv.version || 'N/A' }}</p>
                    </div>
                    <div>
                      <span
                        class="text-accent font-semibold underline underline-offset-2 decoration-text"
                        >Téléchargements :</span
                      >
                      <p class="text-text font-medium">{{ cv.downloadCount }}</p>
                    </div>
                    <div>
                      <span
                        class="text-accent font-semibold underline underline-offset-2 decoration-text"
                        >Dernière mise à jour :</span
                      >
                      <p class="text-text font-medium">{{ formatDate(cv.createdAt) }}</p>
                    </div>
                  </div>
                  <div class="mt-4 flex gap-3">
                    <app-button
                      color="secondary"
                      [customClass]="'!w-auto !px-4 !py-2'"
                      (buttonClick)="downloadCurrentCv()"
                    >
                      <div class="flex items-center gap-2">
                        <img
                          [ngSrc]="'/icons/download.svg'"
                          alt="Télécharger"
                          class="w-4 h-4 icon-invert"
                          width="16"
                          height="16"
                        />
                        <span class="text-text">Télécharger</span>
                      </div>
                    </app-button>
                    <app-button
                      color="accent"
                      [customClass]="'!w-auto !px-4 !py-2'"
                      (buttonClick)="triggerFileInput()"
                    >
                      <div class="flex items-center gap-2">
                        <img
                          [ngSrc]="'/icons/edit.svg'"
                          alt="Remplacer"
                          class="w-4 h-4 icon-invert brightness-0"
                          width="16"
                          height="16"
                        />
                        <span class="text-text">Remplacer</span>
                      </div>
                    </app-button>
                  </div>
                </div>
              } @else {
                <div class="bg-accent/5 rounded-xl p-6 border border-accent/10 text-center">
                  <img
                    [ngSrc]="'/icons/upload.svg'"
                    alt="Upload"
                    class="w-12 h-12 mx-auto mb-4 icon-invert opacity-50"
                    width="48"
                    height="48"
                  />
                  <h2 class="text-lg font-semibold text-accent mb-2">Aucun CV téléchargé</h2>
                  <p class="text-text/70 mb-4">Commencez par télécharger votre CV professionnel</p>
                  <app-button
                    color="accent"
                    [customClass]="'!w-auto !px-6 !py-3'"
                    (buttonClick)="triggerFileInput()"
                  >
                    <div class="flex items-center gap-2">
                      <img
                        [ngSrc]="'/icons/upload.svg'"
                        alt="Upload"
                        class="w-4 h-4 icon-invert brightness-0 invert"
                        width="16"
                        height="16"
                      />
                      <span>Télécharger un CV</span>
                    </div>
                  </app-button>
                </div>
              }
            </div>

            <!-- Section Glisser-déposer -->
            <div
              class="border-2 border-dashed border-primary/20 rounded-xl p-8 text-center bg-primary/2"
              [class.border-accent]="isDragOver()"
              [class.bg-accent-5]="isDragOver()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
            >
              @if (isUploading()) {
                <div class="space-y-4">
                  <div class="w-12 h-12 mx-auto">
                    <img
                      [ngSrc]="'/icons/spinner.svg'"
                      alt="Chargement"
                      class="w-12 h-12 animate-spin icon-invert"
                      width="48"
                      height="48"
                    />
                  </div>
                  <div>
                    <p class="text-lg font-medium text-primary">Téléchargement en cours...</p>
                    <p class="text-text/70">{{ selectedFile()?.name }}</p>
                  </div>
                </div>
              } @else {
                <div class="space-y-4">
                  <div class="w-16 h-16 mx-auto">
                    <img
                      [ngSrc]="'/icons/upload.svg'"
                      alt="Upload"
                      class="w-16 h-16 icon-invert opacity-60"
                      width="64"
                      height="64"
                    />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-primary mb-2">
                      Glissez-déposez votre CV ici
                    </h3>
                    <p class="text-text/70 mb-4">ou cliquez pour sélectionner un fichier</p>
                    <p class="text-sm text-text/60">
                      Format accepté : PDF • Taille maximum : 10 MB
                    </p>
                  </div>

                  @if (selectedFile()) {
                    <div
                      class="bg-background rounded-lg p-4 border border-primary/10 max-w-md mx-auto"
                    >
                      <div class="flex items-center gap-3">
                        <img
                          [ngSrc]="'/icons/cv.svg'"
                          alt="PDF"
                          class="w-8 h-8 icon-invert flex-shrink-0"
                          width="32"
                          height="32"
                        />
                        <div class="flex-1 text-left">
                          <p class="font-medium text-text truncate">{{ selectedFile()?.name }}</p>
                          <p class="text-sm text-text/70">
                            {{ formatFileSize(selectedFile()?.size || 0) }}
                          </p>
                        </div>
                        <button
                          (click)="clearSelection()"
                          class="p-1 hover:bg-red/10 rounded-full transition-colors"
                          aria-label="Supprimer la sélection"
                        >
                          <img
                            [ngSrc]="'/icons/close.svg'"
                            alt="Supprimer"
                            class="w-5 h-5 icon-invert opacity-70 hover:opacity-100"
                            width="20"
                            height="20"
                          />
                        </button>
                      </div>
                    </div>

                    <div class="flex gap-3 justify-center mt-4">
                      <app-button
                        color="secondary"
                        [customClass]="'!w-auto !px-4 !py-2'"
                        (buttonClick)="clearSelection()"
                      >
                        Annuler
                      </app-button>
                      <app-button
                        color="accent"
                        [customClass]="'!w-auto !px-6 !py-2'"
                        (buttonClick)="uploadCv()"
                        [disabled]="!selectedFile()"
                      >
                        <div class="flex items-center gap-2">
                          <img
                            [ngSrc]="'/icons/upload.svg'"
                            alt="Upload"
                            class="w-4 h-4 icon-invert brightness-0 invert"
                            width="16"
                            height="16"
                          />
                          <span>Télécharger</span>
                        </div>
                      </app-button>
                    </div>
                  }

                  @if (!selectedFile()) {
                    <app-button
                      color="primary"
                      [customClass]="'!w-auto !px-6 !py-3 !rounded-full'"
                      (buttonClick)="triggerFileInput()"
                    >
                      Sélectionner un fichier
                    </app-button>
                  }
                </div>
              }
            </div>
          </div>

          <input
            #fileInput
            type="file"
            accept=".pdf,application/pdf"
            (change)="onFileSelected($event)"
            class="hidden"
          />
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class CvAdminComponent {
  private readonly cvService = inject(CvService);
  private readonly toastService = inject(ToastService);
  private readonly _currentCv = signal<CvMetadata | null>(null);
  private readonly _selectedFile = signal<File | null>(null);
  private readonly _isUploading = signal(false);
  private readonly _isDragOver = signal(false);

  readonly currentCv = computed(() => this._currentCv());
  readonly selectedFile = computed(() => this._selectedFile());
  readonly isUploading = computed(() => this._isUploading());
  readonly isDragOver = computed(() => this._isDragOver());

  constructor() {
    this.loadCurrentCv();
  }

  private async loadCurrentCv(): Promise<void> {
    try {
      const cvMeta = await this.cvService.getCurrentCvMetadata();
      this._currentCv.set(cvMeta);
    } catch {
      this._currentCv.set(null);
    }
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      if (this.validateFile(file)) {
        this._selectedFile.set(file);
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(false);

    const file = event.dataTransfer?.files[0];
    if (file && this.validateFile(file)) {
      this._selectedFile.set(file);
    }
  }

  private validateFile(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      this.toastService.danger('Seuls les fichiers PDF sont autorisés');
      return false;
    }

    if (file.size > maxSize) {
      this.toastService.danger('Le fichier ne peut pas dépasser 10 MB');
      return false;
    }

    return true;
  }

  async uploadCv(): Promise<void> {
    const file = this._selectedFile();
    if (!file) return;

    this._isUploading.set(true);

    try {
      await this.cvService.uploadCv(file);
      this.toastService.success('CV téléchargé avec succès !');
      this._selectedFile.set(null);
      await this.loadCurrentCv(); // Refresh CV metadata
    } catch (error: unknown) {
      console.error('Erreur upload CV:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur lors du téléchargement du CV';
      this.toastService.danger(errorMessage);
    } finally {
      this._isUploading.set(false);
    }
  }

  clearSelection(): void {
    this._selectedFile.set(null);
  }

  async downloadCurrentCv(): Promise<void> {
    try {
      await this.cvService.downloadCvAndNotify();
    } catch (error: unknown) {
      console.error('Erreur téléchargement CV:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur lors du téléchargement du CV';
      this.toastService.danger(errorMessage);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
