import { Component, ChangeDetectionStrategy, inject } from "@angular/core";
import { EditCvComponent } from "./edit-cv/edit-cv";
import { ButtonComponent } from "@shared/ui/button/button";
import { NgOptimizedImage } from "@angular/common";
import { CvService } from "@features/admin/services/cv-service";
import { SupabaseService } from "@core/services/supabase-service";
import { ToastService } from "@shared/ui/toast/service/toast-service";

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
            <app-button
              color="accent"
              (buttonClick)="downloadCv()"
              [customClass]="
                !cvStats().hasCV ? 'opacity-50 cursor-not-allowed' : ''
              "
            >
              <div class="flex items-center">
                <img
                  [ngSrc]="'/icons/download.svg'"
                  alt="Télécharger"
                  class="w-4 h-4 mr-2 icon-invert"
                  width="16"
                  height="16"
                />
                @if (cvStats().hasCV) {
                  Télécharger CV
                } @else {
                  Aucun CV
                }
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

        @if (cvLoading()) {
          <div class="flex items-center justify-center py-8">
            <div class="text-text">Chargement des versions...</div>
          </div>
        } @else if (cvStats().hasCV) {
          <div class="space-y-3">
            <!-- CV actuel -->
            <div
              class="flex items-center justify-between p-4 border border-accent rounded-lg hover:shadow-md transition-shadow"
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
                    {{ getFileName() }}
                  </h3>
                  <p class="text-xs text-text/70">
                    {{ cvStats().version }} • Modifié le
                    {{ cvStats().lastUpdated }}
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
                  (click)="downloadCv()"
                  class="p-2 hover:bg-accent/10 rounded-lg transition-colors"
                  title="Télécharger le CV"
                >
                  <img
                    [ngSrc]="'/icons/download.svg'"
                    alt="Télécharger"
                    class="w-4 h-4 icon-invert"
                    width="16"
                    height="16"
                  />
                </button>
              </div>
            </div>
          </div>
        } @else {
          <div class="text-center py-8">
            <img
              [ngSrc]="'/icons/document.svg'"
              alt="Pas de CV"
              class="w-16 h-16 icon-invert mx-auto mb-4 opacity-50"
              width="64"
              height="64"
            />
            <div class="text-text/70 mb-4">Aucune version de CV disponible</div>
            <app-button color="accent">
              <div class="flex items-center">
                <img
                  [ngSrc]="'/icons/upload.svg'"
                  alt="Upload"
                  class="w-4 h-4 mr-2 icon-invert"
                  width="16"
                  height="16"
                />
                Uploader votre premier CV
              </div>
            </app-button>
          </div>
        }
      </div>

      <!-- CV Statistics -->
      <div
        class="bg-background rounded-xl border border-primary-200 dark:border-primary-700 p-6"
      >
        <h2 class="text-lg font-semibold text-text mb-6">Statistiques du CV</h2>

        @if (cvLoading()) {
          <div class="flex items-center justify-center py-8">
            <div class="text-text">Chargement des statistiques...</div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              class="text-center p-4 bg-background border border-accent rounded-lg"
            >
              <div class="text-2xl font-bold text-accent">
                {{ cvStats().version }}
              </div>
              <div class="text-sm text-text/70">Version</div>
            </div>

            <div
              class="text-center p-4 bg-background border border-accent rounded-lg"
            >
              <div class="text-2xl font-bold text-accent">
                {{ cvStats().downloadCount }}
              </div>
              <div class="text-sm text-text/70">Téléchargements</div>
            </div>

            <div
              class="text-center p-4 bg-background border border-accent rounded-lg"
            >
              <div class="text-2xl font-bold text-accent">
                {{ cvStats().fileSize }}
              </div>
              <div class="text-sm text-text/70">Taille du fichier</div>
            </div>

            <div
              class="text-center p-4 bg-background border border-accent rounded-lg"
            >
              <div class="text-2xl font-bold text-accent">
                @if (cvStats().hasCV) {
                  <img
                    [ngSrc]="'/icons/check.svg'"
                    alt="CV présent"
                    class="w-8 h-8 icon-invert mx-auto"
                    width="32"
                    height="32"
                  />
                } @else {
                  <img
                    [ngSrc]="'/icons/close.svg'"
                    alt="Pas de CV"
                    class="w-8 h-8 icon-invert mx-auto"
                    width="32"
                    height="32"
                  />
                }
              </div>
              <div class="text-sm text-text/70">Statut</div>
            </div>
          </div>

          @if (cvStats().hasCV) {
            <div class="mt-6 pt-6 border-t border-accent">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium text-text"
                    >Dernière mise à jour :</span
                  >
                  <span class="text-text/70">{{ cvStats().lastUpdated }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-text">Date d'upload :</span>
                  <span class="text-text/70">{{ cvStats().uploadDate }}</span>
                </div>
              </div>
            </div>
          } @else {
            <div class="mt-6 pt-6 border-t border-accent text-center">
              <div class="text-text/70 mb-4">Aucun CV disponible</div>
              <app-button color="accent">
                <div class="flex items-center">
                  <img
                    [ngSrc]="'/icons/upload.svg'"
                    alt="Upload"
                    class="w-4 h-4 mr-2 icon-invert"
                    width="16"
                    height="16"
                  />
                  Uploader votre premier CV
                </div>
              </app-button>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class CvManagerComponent {
  private readonly cvService = inject(CvService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly toastService = inject(ToastService);

  readonly cvStats = this.cvService.cvStats;
  readonly cvLoading = this.cvService.loading;
  readonly cvData = this.cvService.cvData;

  constructor() {
    // Charger les données CV au démarrage
    this.cvService.loadCvData();
  }

  async downloadCv(): Promise<void> {
    // Vérifier s'il y a un CV
    if (!this.cvStats().hasCV) {
      this.toastService.show({
        message: "Aucun CV disponible à télécharger.",
        type: "error",
      });
      return;
    }

    const user = this.supabaseService.user();
    if (!user) {
      this.toastService.show({
        message: "Vous devez être connecté pour télécharger le CV.",
        type: "error",
      });
      return;
    }

    const publicUrl = await this.supabaseService.downloadCV(user.id);

    if (publicUrl) {
      // Incrémenter le compteur de téléchargements
      await this.cvService.incrementDownloadCount();

      // Ouvrir le CV
      window.open(publicUrl, "_blank");

      this.toastService.show({
        message: "CV téléchargé avec succès.",
        type: "success",
      });
    } else {
      this.toastService.show({
        message: "Impossible de télécharger le CV.",
        type: "error",
      });
    }
  }

  getFileName(): string {
    const data = this.cvData();
    if (!data?.file_path) return "CV_Inconnu.pdf";

    const fileName = data.file_path.split("/").pop();
    return fileName ?? "CV.pdf";
  }
}
