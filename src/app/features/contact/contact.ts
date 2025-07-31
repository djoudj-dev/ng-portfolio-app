import { Component, signal } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { ContactCardGroup } from "./interface/contact.interface";
import { CONTACT_DATA } from "./data/contact-data";
import { ContactMessageCard } from "@features/contact/components/contact-message-card/contact-message-card";

@Component({
  selector: "app-contact",
  imports: [NgOptimizedImage, ReactiveFormsModule, ContactMessageCard],
  templateUrl: "./contact.html",
})
export class Contact {
  readonly contactTitle = signal<string>("Contactez-moi");
  readonly contactSubTitle = signal<string>(
    "N'hésitez pas à me contacter pour toute question ou proposition de collaboration.",
  );

  readonly contactCardGroups = signal<ContactCardGroup[]>(
    CONTACT_DATA.cardGroups,
  );
}
