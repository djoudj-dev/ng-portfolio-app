import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconSvg } from '../../../core/services/icon-svg';

@Component({
  selector: 'app-svg-icon',
  imports: [CommonModule],
  template: `
    <svg
      [attr.width]="width()"
      [attr.height]="height()"
      [class]="iconClass()"
      [style.color]="color()"
      [attr.stroke]="stroke()"
      aria-hidden="true"
      focusable="false"
    >
      <use [attr.href]="'#' + symbolId()"></use>
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      svg {
        transition: all 0.3s ease;
        will-change: transform;
        transform: translateZ(0);
      }

      @keyframes optimizedSpin {
        from {
          transform: translateZ(0) rotate(0deg);
        }
        to {
          transform: translateZ(0) rotate(360deg);
        }
      }

      :host(.using-optimized-spin) svg {
        animation: optimizedSpin 1.5s linear infinite;
        backface-visibility: hidden;
        perspective: 1000;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgIcon implements OnInit {
  // Inputs modernisés avec input() (Angular 17+)
  readonly name = input<string>('');
  readonly width = input<string>('24');
  readonly height = input<string>('24');
  readonly iconClass = input<string>('');
  readonly color = input<string>('currentColor');
  readonly stroke = input<string>('none');
  // Align with build output from scripts/icons.mjs (generates /sprite.svg in public)
  readonly spriteUrl = input<string>('/sprite.svg');

  private readonly iconSvg = inject(IconSvg);
  loaded = signal(false);

  // Support both Iconify notation (e.g., "lucide:house") and hyphenated ids (e.g., "lucide-house")
  readonly symbolId = computed<string>(() => (this.name() ?? '').replace(':', '-'));

  ngOnInit(): void {
    this.iconSvg.loadSprite(this.spriteUrl()).subscribe(() => {
      this.loaded.set(true);
    });
  }
}
