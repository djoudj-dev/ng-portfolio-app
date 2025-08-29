import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { ContactService, ContactMessage } from "@features/contact/services/contact-service";
import { ButtonComponent } from "@shared/ui/button/button";
import { ToastService } from "@shared/ui/toast/service/toast-service";

@Component({
  selector: "app-admin-messages",
  imports: [CommonModule, NgOptimizedImage, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="border-b border-accent pb-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-text">Messages</h1>
          <p class="text-text mt-1">Tous les messages envoyés via le formulaire de contact</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center px-3 py-1 rounded-full border border-accent">
            <img [ngSrc]="'/icons/mail.svg'" alt="Non lus" width="16" height="16" class="w-4 h-4 icon-invert mr-2" />
            <span class="text-sm text-text">Non lus: {{ unreadCount() }}</span>
          </div>
          <app-button (buttonClick)="refresh()" color="accent">Rafraîchir</app-button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-16 text-text">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <span class="ml-3">Chargement des messages...</span>
        </div>
      } @else if (messages().length === 0) {
        <div class="text-center py-16">
          <img [ngSrc]="'/icons/inbox.svg'" alt="Aucun message" width="48" height="48" class="w-12 h-12 mx-auto icon-invert" />
          <h3 class="mt-3 text-text font-medium">Aucun message</h3>
          <p class="text-secondary text-sm">Les messages de contact apparaîtront ici.</p>
        </div>
      } @else {
        <div class="bg-background rounded-xl border border-accent">
          <div class="divide-y divide-accent">
            @for (msg of messages(); track msg.id) {
              <article class="p-4 hover:bg-accent/10 transition-colors">
                <div class="flex items-start gap-4">
                  <div class="pt-1">
                    <span class="inline-block w-2 h-2 rounded-full" [class]="msg.isRead ? 'bg-green-700' : 'bg-red'"></span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h2 class="text-sm sm:text-base font-semibold text-text truncate">{{ msg.subject }}</h2>
                      @if (!msg.isRead) {
                        <span class="text-xxs sm:text-xs px-2 py-0.5 rounded-full border border-accent text-text">Non lu</span>
                      }
                    </div>
                    <div class="text-xs text-secondary mt-1 truncate">
                      De {{ msg.name }} • {{ msg.email }} • {{ formatDate(msg.createdAt) }}
                    </div>
                    <p class="text-sm text-text mt-2 whitespace-pre-wrap line-clamp-3">{{ msg.message }}</p>
                  </div>
                  <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    @if (!msg.isRead) {
                      <app-button color="accent" [customClass]="'px-3 py-1'" (buttonClick)="markAsRead(msg)">Marquer lu</app-button>
                    }
                    <app-button color="primary" [customClass]="'px-3 py-1'" (buttonClick)="view(msg)">Voir</app-button>
                    <app-button color="red" [customClass]="'px-3 py-1'" (buttonClick)="remove(msg)">Supprimer</app-button>
                  </div>
                </div>

                @if (expandedId() === msg.id) {
                  <div class="mt-4 rounded-lg border border-accent p-3 bg-background">
                    <div class="text-sm text-text whitespace-pre-wrap">{{ msg.message }}</div>
                    <div class="mt-3 text-xs text-secondary">
                      ID: {{ msg.id }} • Créé: {{ formatDate(msg.createdAt) }}
                    </div>
                  </div>
                }
              </article>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminMessagesPage {
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);

  readonly messages = signal<ContactMessage[]>([]);
  readonly loading = signal<boolean>(false);
  readonly unreadCount = signal<number>(0);
  readonly expandedId = signal<string | null>(null);

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [list, unread] = await Promise.all([
        this.contactService.getContacts(),
        this.contactService.getUnreadCount(),
      ]);
      this.messages.set(list);
      this.unreadCount.set(unread);
    } finally {
      this.loading.set(false);
    }
  }

  refresh(): void {
    void this.load();
  }

  formatDate(dateIso: string): string {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateIso));
  }

  view(msg: ContactMessage): void {
    this.expandedId.set(this.expandedId() === msg.id ? null : msg.id);
  }

  async markAsRead(msg: ContactMessage): Promise<void> {
    const ok = await this.contactService.markAsRead(msg.id);
    if (ok) {
      this.messages.update(arr => arr.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      this.unreadCount.update(c => Math.max(0, c - 1));
    }
  }

  async remove(msg: ContactMessage): Promise<void> {
    const confirmed = await this.toastService.confirm({ message: "Supprimer ce message ?", confirmText: "Supprimer", cancelText: "Annuler" });
    if (!confirmed) return;
    const ok = await this.contactService.deleteContact(msg.id);
    if (ok) {
      this.messages.update(arr => arr.filter(m => m.id !== msg.id));
      if (!msg.isRead) {
        this.unreadCount.update(c => Math.max(0, c - 1));
      }
      this.toastService.show({ message: "Message supprimé", type: "success" });
    }
  }
}
