import { Component, output } from "@angular/core";
import { LoginFormComponent } from "../login-form/login-form";

@Component({
  selector: "app-login-modal",
  imports: [LoginFormComponent],
  templateUrl: "./login-modal.html",
})
export class LoginModalComponent {
  readonly closeModal = output<void>();
}
