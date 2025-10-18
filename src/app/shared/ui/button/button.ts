import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';

type ButtonColor = 'primary' | 'secondary' | 'accent' | 'red';

const COLOR_CLASSES: Record<ButtonColor, string> = {
  primary: 'bg-primary hover:bg-primary/80 focus:bg-primary/70 active:bg-primary/90',
  secondary: 'bg-secondary hover:bg-secondary/80 focus:bg-secondary/70 active:bg-secondary/90',
  accent: 'bg-accent hover:bg-accent/80 focus:bg-accent/70 active:bg-accent/90',
  red: 'bg-red hover:bg-red/80 focus:bg-red/70 active:bg-red/90',
};

@Component({
  selector: 'app-button',
  template: `
    <button
      [type]="type()"
      [class]="buttonClasses()"
      [disabled]="disabled() || isLoading()"
      (click)="buttonClick.emit($event)"
    >
      @if (isLoading()) {
        <span class="mr-2 inline-block">
          <app-svg-icon
            name="lucide:loader-2"
            [width]="'20'"
            [height]="'20'"
            [iconClass]="'w-5 h-5 animate-spin'"
          />
        </span>
      }
      <ng-content />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SvgIcon],
})
export class ButtonComponent {
  readonly buttonClick = output<MouseEvent>();

  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly color = input<ButtonColor>('primary');
  readonly disabled = input<boolean>(false);
  readonly rounded = input<boolean>(true);
  readonly customClass = input<string>('');
  readonly isLoading = input<boolean>(false);

  readonly buttonClasses = computed(() => {
    const baseClasses =
      'w-full px-4 py-3 text-base font-semibold tracking-wide text-white focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95';
    const colorClasses = COLOR_CLASSES[this.color()];
    const roundedClass = this.rounded() ? 'rounded-lg' : 'rounded-none';
    const disabledClasses =
      this.disabled() || this.isLoading() ? 'opacity-50 cursor-not-allowed' : '';
    const custom = this.customClass();

    return `${baseClasses} ${colorClasses} ${roundedClass} ${disabledClasses} ${custom}`.trim();
  });
}
