import { Component, output, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "app-mobile-overlay",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-30 bg-background bg-opacity-75"
      (click)="onClose()"
    ></div>
  `,
})
export class MobileOverlayComponent {
  closeSidebar = output<void>();

  onClose(): void {
    this.closeSidebar.emit();
  }
}
