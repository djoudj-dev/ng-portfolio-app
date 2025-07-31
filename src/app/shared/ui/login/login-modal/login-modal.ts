import { Component, output } from "@angular/core";
import { LoginFormComponent } from "@shared/ui/login/login-form/login-form";

@Component({
  selector: "app-login-modal",
  imports: [LoginFormComponent],
  template: `
    <div
      class="flex fixed inset-0 z-50 justify-center items-center bg-opacity-50 bg-background"
      (click)="closeModal.emit()"
    >
      <div
        class="p-8 w-full max-w-md border rounded-lg shadow-lg bg-background border-accent"
        (click)="$event.stopPropagation()"
      >
        <h2 class="flex justify-center mb-4 text-2xl font-bold text-text">
          Connexion
        </h2>
        <h3
          class="flex justify-center py-2 mb-4 text-sm font-bold bg-accent rounded-xs text-text"
        >
          Éspace réserver au grand barbu !!
        </h3>
        <app-login-form (loginSuccess)="closeModal.emit()" />
      </div>
    </div>
  `,
})
export class LoginModalComponent {
  readonly closeModal = output<void>();
}
