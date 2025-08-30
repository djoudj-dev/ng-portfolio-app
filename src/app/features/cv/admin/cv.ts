import { ChangeDetectionStrategy, Component, inject, computed } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { ButtonComponent } from "@shared/ui/button/button";
import { ToastService } from "@shared/ui/toast/service/toast-service";
import { AuthService } from "@core/services/auth-service";
import { EditCvComponent } from "@features/cv/components/edit-cv/edit-cv";
import { CvService } from "@features/cv/services/cv-service";

@Component({
  selector: "app-cv-admin-page",
  imports: [CommonModule, NgOptimizedImage, ButtonComponent, EditCvComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="border-b border-accent pb-4">
        <h1 class="text-2xl font-bold text-text">Gestion du CV</h1>
      </div>

      <!-- Bloc upload/remplacement -->
      <div class="bg-background rounded-xl border border-accent p-6">
        <app-edit-cv />
      </div>

      <!-- Bloc métadonnées -->
      <div class="bg-background rounded-xl border border-accent p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-text">Métadonnées actuelles</h2>
          <div class="flex gap-2 items-center">
            <app-button color="accent" (buttonClick)="downloadPublic()" [customClass]="!hasCV() ? 'opacity-50 cursor-not-allowed' : ''">
              <div class="flex items-center">
                <img [ngSrc]="'/icons/download.svg'" alt="Télécharger" class="w-4 h-4 icon-invert mr-2" width="16" height="16" />
                <span class="text-text">Ouvrir</span>
              </div>
            </app-button>
          </div>
        </div>

        @if (loading()) {
          <div class="text-secondary">Chargement…</div>
        } @else if (!hasCV()) {
          <div class="text-secondary">Aucun CV disponible</div>
        } @else {
          <div class="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span class="text-text text-xl">Nom original : </span> <span class="text-lg font-bold border border-primary-950 rounded-md text-text bg-accent-600 px-2">{{ cv.cvData()?.originalName || 'CV.pdf' }}</span></div>
            <div><span class="text-text text-xl">Version : </span> <span class="text-lg font-bold border border-primary-950 rounded-md text-text bg-accent-600 px-2">{{ stats().version }}</span></div>
            <div><span class="text-text text-xl">Upload : </span> <span class="text-lg font-bold border border-primary-950  rounded-md text-text bg-accent-600 px-2">{{ stats().uploadDate }}</span></div>
            <div><span class="text-text text-xl">Taille : </span> <span class="text-lg font-bold border border-primary-950  rounded-md text-text bg-accent-600 px-2">{{ stats().fileSize }}</span></div>
            <div><span class="text-text text-xl">Téléchargements : </span> <span class="text-lg font-bold border border-primary-950  rounded-md text-text bg-accent-600 px-2">{{ stats().downloadCount }}</span></div>
          </div>
        }
      </div>
    </div>
  `,
})
export class CvAdminPage {
  readonly cv = inject(CvService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly loading = this.cv.loading;
  readonly stats = this.cv.cvStats;
  readonly hasCV = computed(() => this.stats().hasCV);

  constructor() {
    void this.cv.loadCvData();
  }

  async downloadPublic(): Promise<void> {
    const user = this.auth.user();
    if (!user) {
      this.toast.show({ message: "Non connecté", type: "error" });
      return;
    }
    const { downloadCvFlow } = await import('@shared/utils/download-cv');
    const ok = await downloadCvFlow({
      cvService: this.cv,
      toastService: this.toast
    });
    if (ok === null) {
      this.toast.show({ message: "Échec du téléchargement", type: "error" });
    }
  }
}
