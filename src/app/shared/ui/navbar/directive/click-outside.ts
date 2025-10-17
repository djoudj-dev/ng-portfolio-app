import { Directive, ElementRef, HostListener, inject, input, output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutside {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly isEnabled = input(true);
  readonly clickOutside = output<void>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isEnabled()) return;

    const target = event.target as Node | null;
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.clickOutside.emit();
    }
  }
}
