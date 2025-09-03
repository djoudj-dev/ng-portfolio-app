import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '@shared/ui/button/button';

@Component({
  selector: 'app-project-pagination',
  imports: [ButtonComponent],
  template: `
    @if (totalPages() > 1) {
      <div class="mt-8 flex items-center justify-center space-x-2">
        <app-button
          [color]="'accent'"
          [customClass]="'px-3 py-1 text-sm'"
          (buttonClick)="prevPage()"
          [disabled]="currentPage() === 1"
          aria-label="Page précédente"
        >
          &laquo;
        </app-button>

        @for (page of getPageNumbers(); track page) {
          <app-button
            [color]="currentPage() === page ? 'secondary' : 'accent'"
            [customClass]="'px-3 py-1 text-sm'"
            (buttonClick)="goToPage(page)"
            [attr.aria-current]="currentPage() === page ? 'page' : null"
            [attr.aria-label]="'Page ' + page"
          >
            {{ page }}
          </app-button>
        }

        <app-button
          [color]="'accent'"
          [customClass]="'px-3 py-1 text-sm'"
          (buttonClick)="nextPage()"
          [disabled]="currentPage() === totalPages()"
          aria-label="Page suivante"
        >
          &raquo;
        </app-button>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPagination {
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(1);

  readonly pageChange = output<number>();

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }
}
