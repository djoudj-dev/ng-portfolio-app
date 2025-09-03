import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AnalyticsService } from '@features/analytics';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, interval, merge } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ProjectService } from '@features/projects';
import { CvService } from '@features/cv';

@Component({
  selector: 'app-counter-admin',
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 items-center justify-center gap-6">
      <article
        class="bg-background rounded-2xl border border-accent shadow-sm hover:shadow-md overflow-hidden group"
      >
        <div class="p-6">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform duration-300"
            >
              <img
                [ngSrc]="'/icons/cv.svg'"
                alt="Logo du CV"
                width="24"
                height="24"
                class="h-6 w-6"
              />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-text">{{ cv()?.downloadCount || 0 }}</span>
              </div>
              <p class="text-secondary text-sm font-medium">Téléchargements du CV</p>
            </div>
          </div>
        </div>
        <div class="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
      </article>

      <article
        class="bg-background rounded-2xl border border-accent shadow-sm hover:shadow-md overflow-hidden group"
      >
        <div class="p-6">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-xl flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform duration-300"
            >
              <img
                [ngSrc]="'/icons/project.svg'"
                alt="Logo du CV"
                width="24"
                height="24"
                class="h-6 w-6"
              />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-text">{{ projects().length }}</span>
              </div>
              <p class="text-secondary text-sm font-medium">Projets créés</p>
            </div>
          </div>
        </div>
        <div class="h-1 bg-gradient-to-r from-accent-500 to-accent-600"></div>
      </article>

      <article
        class="bg-background rounded-2xl border border-accent shadow-sm hover:shadow-md overflow-hidden group"
      >
        <div class="p-6">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-transform duration-300"
            >
              <img
                [ngSrc]="'/icons/look.svg'"
                alt="Logo du CV"
                width="24"
                height="24"
                class="h-6 w-6"
              />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-text">{{
                  analytics()?.uniqueVisitors || 0
                }}</span>
                <span class="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full"
                  >+12%</span
                >
              </div>
              <p class="text-secondary text-sm font-medium">Visiteurs jour</p>
            </div>
          </div>
        </div>
        <div class="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
      </article>
    </div>
  `,
})
export class CounterAdmin {
  readonly projectService = inject(ProjectService);
  private readonly cvService = inject(CvService);
  private readonly analyticsService = inject(AnalyticsService);

  private readonly analyticsResponse = toSignal(
    interval(60000).pipe(
      startWith(0),
      switchMap(() =>
        from(
          this.analyticsService.getTotalVisits({
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            period: 'day',
          }),
        ),
      ),
    ),
    {
      initialValue: null,
    },
  );
  readonly analytics = computed(() => this.analyticsResponse());

  private readonly projectsResponse = toSignal(from(this.projectService.getAllProjects()), {
    initialValue: { projects: [], total: 0, page: 1, limit: 10, totalPages: 0 },
  });
  readonly projects = computed(() => this.projectsResponse()?.projects ?? []);

  private readonly cvResponse = toSignal(
    merge(interval(30000).pipe(startWith(0)), this.cvService.cvDownloaded$).pipe(
      switchMap(() => from(this.cvService.getCurrentCvMetadata())),
    ),
    {
      initialValue: null,
    },
  );
  readonly cv = computed(() => this.cvResponse());
}
