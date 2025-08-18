import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SidebarItemComponent } from './sidebar-item';

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  children?: SidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [NgOptimizedImage, SidebarItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside [class]="sidebarClasses()">
      <div class="flex h-full flex-col">
        <!-- Header -->
        <div class="flex h-16 items-center justify-between px-4 border-b border-accent">
          <div [class]="headerClasses()">
            <img
              ngSrc="/logo.svg"
              alt="Logo"
              [class]="logoClasses()"
              width="32"
              height="32"
            />
            @if (shouldShowTitle()) {
              <h1 class="text-lg font-semibold text-text">Admin</h1>
            }
          </div>

          @if (isDesktop()) {
            <button
              (click)="onToggleCollapse()"
              class="p-2 rounded-lg hover:bg-accent text-text transition-colors"
              [attr.title]="collapseButtonTitle()"
            >
              <img
                ngSrc="/icons/arrow-b.svg"
                alt="Toggle sidebar"
                [class]="arrowClasses()"
                width="20"
                height="20"
              />
            </button>
          }

          @if (isMobile()) {
            <button
              (click)="onClose()"
              class="p-2 rounded-lg hover:bg-accent text-text"
            >
              <img
                ngSrc="/icons/close.svg"
                alt="Fermer menu"
                class="w-5 h-5 icon-invert"
                width="20"
                height="20"
              />
            </button>
          }
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-4 space-y-2">
          @for (item of items(); track item.id) {
            <app-sidebar-item
              [item]="item"
              [sidebarCollapsed]="collapsed()"
              [activeSection]="activeSection()"
              [sectionClasses]="sectionClasses()"
              [subSectionClasses]="subSectionClasses()"
              (selectSection)="onSelectSection($event)"
              (selectSubSection)="onSelectSubSection($event)"
            />
          }
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-accent">
          <div [class]="footerClasses()" [attr.title]="footerTitle()">
            <img
              [ngSrc]="'/icons/admin.svg'"
              alt="Icône admin"
              [class]="adminIconClasses()"
              width="16"
              height="16"
            />
            @if (shouldShowAdminLabel()) {
              <span class="truncate">Mode Administrateur</span>
            }
          </div>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  // Inputs modernes
  items = input.required<SidebarItem[]>();
  collapsed = input.required<boolean>();
  isOpen = input.required<boolean>();
  windowWidth = input.required<number>();
  activeSection = input.required<string>();
  sectionClasses = input.required<string>();
  subSectionClasses = input.required<string>();

  // Outputs modernes
  toggleCollapse = output<void>();
  closeSidebar = output<void>();
  selectSection = output<SidebarItem>();
  selectSubSection = output<SidebarItem>();

  // Computed signals
  isDesktop = computed(() => this.windowWidth() >= 1024);
  isMobile = computed(() => this.windowWidth() < 1024);
  
  shouldShowTitle = computed(() => !this.collapsed());
  shouldShowAdminLabel = computed(() => !this.collapsed());

  sidebarClasses = computed(() => {
    const baseClasses = 'fixed inset-y-0 left-0 z-50 bg-background shadow-text border-accent border-r transition-all duration-300 transform lg:translate-x-0';
    const widthClass = this.getWidthClass();
    const transformClass = this.getTransformClass();
    return `${baseClasses} ${widthClass} ${transformClass}`;
  });

  headerClasses = computed(() => 
    this.collapsed() ? 'flex items-center justify-center' : 'flex items-center'
  );

  logoClasses = computed(() => 
    this.collapsed() ? 'w-8 h-8' : 'w-8 h-8 mr-2'
  );

  collapseButtonTitle = computed(() => 
    this.collapsed() ? 'Étendre la sidebar' : 'Rétracter la sidebar'
  );

  arrowClasses = computed(() => {
    const baseClass = 'w-5 h-5 icon-invert transition-transform';
    const rotation = this.collapsed() ? ' -rotate-90' : ' rotate-90';
    return baseClass + rotation;
  });

  footerClasses = computed(() => {
    const baseClass = 'flex items-center text-sm text-text/80';
    const centerClass = this.collapsed() ? ' justify-center' : '';
    return baseClass + centerClass;
  });

  footerTitle = computed(() => 
    this.collapsed() ? 'Mode Administrateur' : null
  );

  adminIconClasses = computed(() => {
    const baseClass = 'w-4 h-4 icon-invert';
    const marginClass = this.collapsed() ? '' : ' mr-2';
    return baseClass + marginClass;
  });

  private getWidthClass(): string {
    if (this.collapsed() && this.isDesktop()) {
      return 'w-16';
    }
    return this.collapsed() ? '' : 'w-64';
  }

  private getTransformClass(): string {
    if (this.isMobile()) {
      return this.isOpen() ? 'translate-x-0' : '-translate-x-full';
    }
    return 'translate-x-0';
  }

  // Event handlers
  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }

  onClose(): void {
    this.closeSidebar.emit();
  }

  onSelectSection(item: SidebarItem): void {
    this.selectSection.emit(item);
  }

  onSelectSubSection(item: SidebarItem): void {
    this.selectSubSection.emit(item);
  }
}