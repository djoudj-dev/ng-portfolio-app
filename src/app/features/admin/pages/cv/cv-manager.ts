import { Component, ChangeDetectionStrategy } from "@angular/core";
import { EditCvComponent } from "@features/admin/dashboard/edit-cv/edit-cv";
import { ButtonComponent } from "@shared/ui/button/button";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-cv-manager",
  imports: [EditCvComponent, ButtonComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-primary-200 dark:border-primary-700 pb-4">
        <h1 class="text-2xl font-bold text-text">Gestion du CV</h1>
        <p class="text-secondary mt-1">Modifiez et gérez votre CV personnel</p>
      </div>

      <!-- CV Editor -->
      <div
        class="bg-background rounded-xl border border-primary-200 dark:border-primary-700 p-6"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-text">Éditeur de CV</h2>
          <div class="flex gap-2">
            <app-button color="secondary">
              <div class="flex items-center">
                <img
                  [ngSrc]="'/icons/preview.svg'"
                  alt="Prévisualiser"
                  class="w-4 h-4 mr-2 icon-invert"
                  width="16"
                  height="16"
                />
                Prévisualiser
              </div>
            </app-button>
            <app-button color="accent">
              <div class="flex items-center">
                <img
                  [ngSrc]="'/icons/download.svg'"
                  alt="Télécharger"
                  class="w-4 h-4 mr-2 icon-invert"
                  width="16"
                  height="16"
                />
                Télécharger
              </div>
            </app-button>
          </div>
        </div>

        <app-edit-cv />
      </div>

      <!-- CV Versions -->
      <div
        class="bg-background rounded-xl border border-primary-200 dark:border-primary-700 p-6"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-text">Versions du CV</h2>
          <app-button color="primary">
            <div class="flex items-center">
              <img
                [ngSrc]="'/icons/upload.svg'"
                alt="Upload"
                class="w-4 h-4 mr-2 icon-invert"
                width="16"
                height="16"
              />
              Nouvelle version
            </div>
          </app-button>
        </div>

        <div class="space-y-3">
          <div
            class="flex items-center justify-between p-4 border border-primary-200 dark:border-primary-700 rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="flex items-center space-x-4">
              <img
                [ngSrc]="'/icons/document.svg'"
                alt="CV"
                class="w-8 h-8 icon-invert"
                width="32"
                height="32"
              />
              <div>
                <h3 class="text-sm font-medium text-text">
                  CV_Julien_Nedellec_2024.pdf
                </h3>
                <p class="text-xs text-secondary">
                  Version courante • Modifié le 15/11/2024
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span
                class="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full"
              >
                Actif
              </span>
              <button
                class="p-2 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-lg"
              >
                <img
                  [ngSrc]="'/icons/download.svg'"
                  alt="Télécharger"
                  class="w-4 h-4 icon-invert"
                  width="16"
                  height="16"
                />
              </button>
              <button
                class="p-2 hover:bg-red-100 dark:hover:bg-red-800 rounded-lg"
              >
                <img
                  [ngSrc]="'/icons/trash.svg'"
                  alt="Supprimer"
                  class="w-4 h-4 icon-invert"
                  width="16"
                  height="16"
                />
              </button>
            </div>
          </div>

          <div
            class="flex items-center justify-between p-4 border border-primary-200 dark:border-primary-700 rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="flex items-center space-x-4">
              <img
                [ngSrc]="'/icons/document.svg'"
                alt="CV"
                class="w-8 h-8 icon-invert"
                width="32"
                height="32"
              />
              <div>
                <h3 class="text-sm font-medium text-text">
                  CV_Julien_Nedellec_2024_v2.pdf
                </h3>
                <p class="text-xs text-secondary">
                  Ancienne version • Modifié le 10/11/2024
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span
                class="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded-full"
              >
                Archivé
              </span>
              <button
                class="p-2 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-lg"
              >
                <img
                  [ngSrc]="'/icons/download.svg'"
                  alt="Télécharger"
                  class="w-4 h-4 icon-invert"
                  width="16"
                  height="16"
                />
              </button>
              <button
                class="p-2 hover:bg-accent-100 dark:hover:bg-accent-800 rounded-lg"
              >
                <img
                  [ngSrc]="'/icons/restore.svg'"
                  alt="Restaurer"
                  class="w-4 h-4 icon-invert"
                  width="16"
                  height="16"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CV Statistics -->
      <div
        class="bg-background rounded-xl border border-primary-200 dark:border-primary-700 p-6"
      >
        <h2 class="text-lg font-semibold text-text mb-6">Statistiques du CV</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">247</div>
            <div class="text-sm text-secondary">Téléchargements</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-secondary">12</div>
            <div class="text-sm text-secondary">Cette semaine</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-accent">3.2 MB</div>
            <div class="text-sm text-secondary">Taille du fichier</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CvManagerComponent {}
