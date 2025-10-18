import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ButtonComponent } from '@shared/ui/button/button';
import { SvgIcon } from '@app/shared/ui/icon-svg/icon-svg';

export type SubmissionStatus = 'success' | 'error';

@Component({
  selector: 'app-contact-status-message',
  imports: [ButtonComponent, SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-14">
      <div class="text-center">
        @if (status() === 'success') {
          <app-svg-icon
            [name]="'lucide:circle-check-big'"
            class="mx-auto h-32 w-32 text-green-500"
            width="128"
            height="128"
          />

          <p class="text-text mb-2 text-xl font-bold">Message envoyé avec succès!</p>
          <p class="text-text/70 mb-6 text-center">
            Merci pour votre message. Je vous répondrai dans les plus brefs délais.
          </p>
        } @else {
          <app-svg-icon
            [name]="'lucide:circle-x'"
            class="mx-auto h-32 w-32 text-red-500"
            width="128"
            height="128"
          />

          <p class="text-text mb-2 text-xl font-bold">Erreur d'envoi</p>
          <p class="text-text/70 mb-6 text-center">
            Une erreur s'est produite lors de l'envoi de votre message. Veuillez réessayer.
          </p>
        }
      </div>

      <app-button color="accent" customClass="px-6 py-2" (buttonClick)="tryAgain.emit()">
        {{ status() === 'success' ? 'Envoyer un autre message' : 'Réessayer' }}
      </app-button>
    </div>
  `,
})
export class ContactStatusMessage {
  readonly status = input.required<SubmissionStatus>();
  readonly tryAgain = output<void>();
}
