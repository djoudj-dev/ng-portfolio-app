import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIcon } from '../icon-svg/icon-svg';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, SvgIcon],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  currentYear = signal<number>(new Date().getFullYear());
}
