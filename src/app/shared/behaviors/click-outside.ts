import { Directive, ElementRef, inject } from "@angular/core";
import { input, output } from "@angular/core";

@Directive({
  selector: "[appClickOutside]",
  host: {
    "(document:click)": "onDocumentClick($event)",
  },
})
export class ClickOutsideBehaviorDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly appClickOutsideEnabled = input<boolean>(true);
  readonly clickedOutside = output<void>();

  onDocumentClick(event: MouseEvent) {
    if (!this.appClickOutsideEnabled()) return;
    const host = this.el.nativeElement;
    if (host && !host.contains(event.target as Node)) {
      this.clickedOutside.emit();
    }
  }
}
