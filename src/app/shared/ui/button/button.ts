import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  Signal,
} from "@angular/core";

@Component({
  selector: "app-button",
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <button
      class="w-full text-base font-semibold tracking-wide focus:outline-none"
      [type]="type()"
      [ngClass]="buttonClasses()"
      [disabled]="disabled()"
      (click)="buttonClick.emit($event)"
    >
      @if (isLoading()) {
        <span class="mr-2 inline-block">
          <img
            [ngSrc]="iconSpinner()"
            class="text-text icon-invert h-4 w-4 animate-spin"
            alt="Loading"
            height="24"
            width="24"
          />
        </span>
      }
      <ng-content />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly buttonClick = output<MouseEvent>();
  readonly text = input<string>("");
  readonly type = input<"button" | "submit" | "reset">("button");
  readonly color = input<"primary" | "secondary" | "accent">("primary");
  readonly disabled = input<boolean>(false);
  readonly noRounded = input<boolean>(false);
  readonly rounded = input<boolean>(true);
  readonly customClass = input<string>("");
  readonly isLoading = input<boolean>(false);

  readonly iconSpinner = signal("icons/spinner.svg");

  readonly buttonClasses: Signal<Record<string, boolean>> = computed(() => ({
    "bg-primary text-white hover:bg-primary/80 focus:bg-primary/70 active:bg-primary/90":
      this.color() === "primary",
    "bg-secondary text-white hover:bg-secondary/80 focus:bg-secondary/70 active:bg-secondary/90":
      this.color() === "secondary",
    "bg-accent text-white hover:bg-accent/80 focus:bg-accent/70 active:bg-accent/90":
      this.color() === "accent",

    "transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95": true,

    "rounded-lg": this.rounded(),
    "rounded-none": this.noRounded(),

    [this.customClass()]: !!this.customClass(),

    "opacity-50 cursor-not-allowed": this.disabled(),
  }));
}
