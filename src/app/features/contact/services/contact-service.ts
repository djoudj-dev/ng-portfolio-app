import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "@environments/environment";
import { ContactForm } from "@features/contact/interface/contact.interface";
import { EMAIL_TEMPLATE } from "@features/contact/templates/email-template";
import { EMAIL_CONFIRMATION_TEMPLATE } from "@features/contact/templates/email-confirmation-template";

@Injectable({ providedIn: "root" })
export class ContactService {
  readonly status = signal<"idle" | "sending" | "sent" | "error">("idle");
  private readonly http = inject(HttpClient);

  private buildEmailHtml(payload: ContactForm): string {
    const escapedMessage = this.escape(payload.message).replace(/\n/g, "<br>");

    return EMAIL_TEMPLATE.replace(/{{name}}/g, this.escape(payload.name))
      .replace(/{{email}}/g, this.escape(payload.email))
      .replace(/{{subject}}/g, this.escape(payload.subject))
      .replace(/{{message}}/g, escapedMessage);
  }

  private buildConfirmationHtml(name: string): string {
    return EMAIL_CONFIRMATION_TEMPLATE.replace(/{{name}}/g, this.escape(name));
  }

  private escape(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async sendMail(payload: ContactForm): Promise<boolean> {
    this.status.set("sending");

    const emailToOwner = this.buildEmailHtml(payload);
    const emailToUser = this.buildConfirmationHtml(payload.name);

    const requestBody = {
      fromName: payload.name,
      fromEmail: payload.email,
      subject: payload.subject,
      message: payload.message,
      htmlUserToOwner: emailToOwner,
      htmlOwnerToUser: emailToUser,
    };

    try {
      const response = await firstValueFrom(
        this.http.post<{ success?: boolean; message?: string; ids?: string[] }>(
          `${environment.supabaseUrl}/functions/v1/resend-email`,
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${environment.supabaseKey}`,
            },
          },
        ),
      );

      if (response?.success || response?.ids?.length) {
        this.status.set("sent");
        return true;
      } else {
        console.error("Erreur de réponse:", response);
        this.status.set("error");
        return false;
      }
    } catch (err) {
      console.error("Erreur d'envoi:", err);
      this.status.set("error");
      return false;
    }
  }
}
