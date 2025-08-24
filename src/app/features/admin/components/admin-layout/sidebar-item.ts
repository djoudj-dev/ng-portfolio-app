import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";
import { NgOptimizedImage } from "@angular/common";

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  children?: SidebarItem[];
}

@Component({
  selector: "app-sidebar-item",
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <button
        (click)="onSelectSection()"
        [class]="buttonClasses()"
        class="w-full flex items-center text-sm font-medium rounded-lg transition-all duration-200 group relative"
        [attr.title]="tooltipText()"
      >
        <img
          [ngSrc]="item().icon"
          [alt]="'Icône ' + item().label"
          [class]="iconClasses()"
          width="20"
          height="20"
        />

        @if (shouldShowLabel()) {
          <span class="truncate">{{ item().label }}</span>
          @if (shouldShowArrow()) {
            <img
              ngSrc="/icons/arrow-b.svg"
              alt="Flèche"
              [class]="arrowClasses()"
              width="16"
              height="16"
            />
          }
        }

        @if (shouldShowTooltip()) {
          <div
            class="absolute left-full ml-2 px-2 py-1 bg-background text-text text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none"
          >
            {{ item().label }}
          </div>
        }
      </button>

      @if (shouldShowSubMenu()) {
        <div class="ml-8 mt-2 space-y-1">
          @for (child of item().children; track child.id) {
            <button
              (click)="onSelectSubSection(child)"
              [class]="subSectionClasses()"
              class="w-full flex items-center px-3 py-2 text-xs rounded-lg transition-all duration-200"
            >
              <img
                [ngSrc]="child.icon"
                [alt]="'Icône ' + child.label"
                class="mr-2 w-4 h-4 icon-invert"
                width="16"
                height="16"
              />
              {{ child.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class SidebarItemComponent {
  // Inputs modernes
  item = input.required<SidebarItem>();
  sidebarCollapsed = input.required<boolean>();
  activeSection = input.required<string>();
  sectionClasses = input.required<string>();
  subSectionClasses = input.required<string>();

  // Outputs modernes
  selectSection = output<SidebarItem>();
  selectSubSection = output<SidebarItem>();

  // Computed signals
  shouldShowLabel = computed(() => !this.sidebarCollapsed());
  shouldShowTooltip = computed(() => this.sidebarCollapsed());
  shouldShowArrow = computed(
    () => this.item().children && !this.sidebarCollapsed(),
  );
  shouldShowSubMenu = computed(
    () =>
      this.item().children &&
      this.activeSection() === this.item().id &&
      !this.sidebarCollapsed(),
  );

  tooltipText = computed(() =>
    this.shouldShowTooltip() ? this.item().label : null,
  );

  buttonClasses = computed(() => {
    const baseClasses = this.sectionClasses();
    const layoutClasses = this.sidebarCollapsed()
      ? "px-2 py-3 justify-center"
      : "px-3 py-2";
    return `${baseClasses} ${layoutClasses}`;
  });

  iconClasses = computed(() => {
    const baseClass =
      "w-5 h-5 transition-transform group-hover:scale-110 icon-invert flex-shrink-0";
    const marginClass = this.sidebarCollapsed() ? "" : " mr-3";
    return baseClass + marginClass;
  });

  arrowClasses = computed(() => {
    const baseClass =
      "ml-auto w-4 h-4 icon-invert transition-transform flex-shrink-0";
    const rotationClass =
      this.activeSection() === this.item().id ? " rotate-90" : "";
    return baseClass + rotationClass;
  });

  onSelectSection(): void {
    this.selectSection.emit(this.item());
  }

  onSelectSubSection(child: SidebarItem): void {
    this.selectSubSection.emit(child);
  }
}
