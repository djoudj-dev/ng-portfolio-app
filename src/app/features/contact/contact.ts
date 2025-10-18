import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { type ContactCardGroup } from './interface/contact.interface';
import { CONTACT_DATA } from './data/contact-data';
import { ContactMessageCard } from '@features/contact/components/contact-message-card/contact-message-card';
import { SvgIcon } from '@app/shared/ui/icon-svg/icon-svg';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, ContactMessageCard, SvgIcon],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly router = inject(Router);

  readonly contactTitle = 'Contactez-moi';
  readonly contactSubTitle = "N'hésitez pas à me contacter pour toute question ou proposition de collaboration.";

  readonly contactCardGroups: readonly ContactCardGroup[] = CONTACT_DATA.cardGroups;

  navigateToTop(): void {
    this.router.navigate(['/']);
  }
}
