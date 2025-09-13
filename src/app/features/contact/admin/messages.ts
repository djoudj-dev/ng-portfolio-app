import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ContactService, ContactMessage } from '@features/contact/services/contact-service';
import { ButtonComponent } from '@shared/ui/button/button';
import { ToastService } from '@shared/ui/toast/service/toast-service';

@Component({
  selector: 'app-admin-messages',
  imports: [CommonModule, NgOptimizedImage, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-6xl mx-auto p-6 space-y-8">
      <!-- Header Section with Enhanced Design -->
      <header
        class="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-accent/20 shadow-sm"
      >
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <img
                  [ngSrc]="'/icons/mail.svg'"
                  alt="Messages"
                  width="24"
                  height="24"
                  class="w-6 h-6 icon-invert"
                />
              </div>
              <h1 class="text-3xl font-bold text-text">Messages</h1>
            </div>
            <p class="text-secondary text-base max-w-2xl">
              Gestion centralisée des messages reçus via le formulaire de contact
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="flex items-center gap-4">
              <div
                class="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-accent/30 shadow-sm"
              >
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-red rounded-full animate-pulse"></div>
                  <span class="text-sm font-medium text-text"> {{ unreadCount() }} non lus </span>
                </div>
              </div>

              <div
                class="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-accent/30 shadow-sm"
              >
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span class="text-sm font-medium text-text"> {{ messages().length }} total </span>
                </div>
              </div>
            </div>

            <app-button (buttonClick)="refresh()" color="accent" [customClass]="'px-6 py-2.5'">
              Actualiser
            </app-button>
          </div>
        </div>
      </header>

      <main class="space-y-6">
        @if (loading()) {
          <div class="flex items-center justify-center py-24 text-text">
            <div class="text-center space-y-4">
              <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"
              ></div>
              <p class="text-secondary font-medium">Chargement des messages...</p>
            </div>
          </div>
        } @else if (messages().length === 0) {
          <div class="text-center py-24">
            <div class="bg-background rounded-2xl border border-accent/20 p-12 max-w-md mx-auto">
              <div
                class="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <img
                  [ngSrc]="'/icons/inbox.svg'"
                  alt="Aucun message"
                  width="40"
                  height="40"
                  class="w-10 h-10 icon-invert"
                />
              </div>
              <h3 class="text-xl font-semibold text-text mb-2">Aucun message</h3>
              <p class="text-secondary">
                Les nouveaux messages de contact apparaîtront automatiquement ici.
              </p>
            </div>
          </div>
        } @else {
          <div class="space-y-4">
            @for (msg of messages(); track msg.id) {
              <article
                class="bg-background rounded-2xl border border-accent/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div class="p-6">
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 pt-1">
                      <div class="relative">
                        <span
                          class="inline-block w-3 h-3 rounded-full border-2 border-background"
                          [class]="msg.isRead ? 'bg-green-500' : 'bg-red-500'"
                        ></span>
                        @if (!msg.isRead) {
                          <span
                            class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"
                          ></span>
                        }
                      </div>
                    </div>

                    <div class="flex-1 min-w-0 space-y-3">
                      <div class="flex flex-wrap items-start justify-between gap-3">
                        <div class="space-y-1">
                          <div class="flex items-center gap-3">
                            <h2 class="text-lg font-semibold text-text truncate">
                              {{ msg.subject }}
                            </h2>
                            @if (!msg.isRead) {
                              <span
                                class="bg-red-500/10 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full border border-red-500/20"
                              >
                                Nouveau
                              </span>
                            }
                          </div>
                          <div class="text-sm text-secondary flex items-center gap-2">
                            <span class="font-medium">{{ msg.name }}</span>
                            <span>•</span>
                            <span>{{ msg.email }}</span>
                            <span>•</span>
                            <time class="font-medium">{{ formatDate(msg.createdAt) }}</time>
                          </div>
                        </div>
                      </div>

                      <p class="text-text leading-relaxed line-clamp-2">
                        {{ msg.message }}
                      </p>
                    </div>

                    <div class="flex-shrink-0">
                      <div class="flex flex-col sm:flex-row gap-2">
                        @if (!msg.isRead) {
                          <app-button
                            color="accent"
                            [customClass]="'px-4 py-2 text-sm'"
                            (buttonClick)="markAsRead(msg)"
                          >
                            Marquer lu
                          </app-button>
                        }
                        <app-button
                          color="primary"
                          [customClass]="'px-4 py-2 text-sm'"
                          (buttonClick)="view(msg)"
                        >
                          {{ expandedId() === msg.id ? 'Masquer' : 'Voir' }}
                        </app-button>
                        <app-button
                          color="red"
                          [customClass]="'px-4 py-2 text-sm'"
                          (buttonClick)="remove(msg)"
                        >
                          Supprimer
                        </app-button>
                      </div>
                    </div>
                  </div>

                  @if (expandedId() === msg.id) {
                    <div class="mt-6 pt-6 border-t border-accent/20">
                      <div class="bg-accent/5 rounded-xl p-4 space-y-4">
                        <div class="space-y-2">
                          <h4 class="text-sm font-semibold text-text uppercase tracking-wide">
                            Message complet
                          </h4>
                          <div
                            class="text-text whitespace-pre-wrap leading-relaxed bg-background rounded-lg p-4 border border-accent/20"
                          >
                            {{ msg.message }}
                          </div>
                        </div>

                        <div class="pt-3 border-t border-accent/20">
                          <div class="flex flex-wrap gap-6 text-xs text-secondary">
                            <div class="flex items-center gap-2">
                              <span class="font-medium">ID:</span>
                              <code class="bg-accent/10 px-2 py-1 rounded font-mono">{{
                                msg.id
                              }}</code>
                            </div>
                            <div class="flex items-center gap-2">
                              <span class="font-medium">Reçu le:</span>
                              <span>{{ formatDate(msg.createdAt) }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Zone de réponse -->
                        <div class="pt-4 border-t border-accent/20 space-y-3">
                          <h4 class="text-sm font-semibold text-text uppercase tracking-wide">
                            Répondre à {{ msg.email }}
                          </h4>
                          <div class="space-y-3">
                            <input
                              type="text"
                              class="w-full px-3 py-2 rounded-lg border border-accent/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                              placeholder="Objet (optionnel)"
                              [value]="getReplySubject(msg.id)"
                              (input)="onReplySubjectChange(msg.id, '' + ($any($event.target).value ?? ''))"
                            />
                            <textarea
                              rows="4"
                              class="w-full px-3 py-2 rounded-lg border border-accent/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                              placeholder="Votre réponse..."
                              [value]="getReplyText(msg.id)"
                              (input)="onReplyChange(msg.id, '' + ($any($event.target).value ?? ''))"
                            ></textarea>
                            <div class="flex items-center gap-3">
                              <app-button
                                color="primary"
                                [disabled]="isSending(msg.id) || !canSend(msg.id)"
                                [customClass]="'px-4 py-2 text-sm'"
                                (buttonClick)="sendReply(msg)"
                              >
                                {{ isSending(msg.id) ? 'Envoi...' : 'Envoyer la réponse' }}
                              </app-button>
                              <app-button
                                color="accent"
                                [customClass]="'px-4 py-2 text-sm'"
                                (buttonClick)="clearReply(msg.id)"
                              >
                                Effacer
                              </app-button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </article>
            }
          </div>
        }
      </main>
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

  // Etat pour la réponse
  private readonly replyTexts = signal<Record<string, string>>({});
  private readonly replySubjects = signal<Record<string, string>>({});
  private readonly sendingId = signal<string | null>(null);

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
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateIso));
  }

  view(msg: ContactMessage): void {
    this.expandedId.set(this.expandedId() === msg.id ? null : msg.id);
  }

  async markAsRead(msg: ContactMessage): Promise<void> {
    const ok = await this.contactService.markAsRead(msg.id);
    if (ok) {
      this.messages.update((arr) => arr.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)));
      this.unreadCount.update((c) => Math.max(0, c - 1));
    }
  }

  async remove(msg: ContactMessage): Promise<void> {
    const confirmed = await this.toastService.confirm({
      title: 'Confirmer la suppression',
      message: 'Supprimer ce message ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
    });
    if (!confirmed) return;
    const ok = await this.contactService.deleteContact(msg.id);
    if (ok) {
      this.messages.update((arr) => arr.filter((m) => m.id !== msg.id));
      if (!msg.isRead) {
        this.unreadCount.update((c) => Math.max(0, c - 1));
      }
      this.toastService.success('Message supprimé');
    }
  }

  // --- Réponse ---
  getReplyText(id: string): string {
    return this.replyTexts()[id] ?? '';
  }

  onReplyChange(id: string, value: string): void {
    this.replyTexts.update((map) => ({ ...map, [id]: value }));
  }

  getReplySubject(id: string): string {
    return this.replySubjects()[id] ?? '';
  }

  onReplySubjectChange(id: string, value: string): void {
    this.replySubjects.update((map) => ({ ...map, [id]: value }));
  }

  canSend(id: string): boolean {
    return this.getReplyText(id).trim().length > 0;
  }

  isSending(id: string): boolean {
    return this.sendingId() === id;
  }

  clearReply(id: string): void {
    const map = { ...this.replyTexts() };
    delete map[id];
    this.replyTexts.set(map);

    const mapS = { ...this.replySubjects() };
    delete mapS[id];
    this.replySubjects.set(mapS);
  }

  async sendReply(msg: ContactMessage): Promise<void> {
    const id = msg.id;
    const body = this.getReplyText(id).trim();
    if (!body) return;
    const subject = (this.getReplySubject(id) || `Re: ${msg.subject}`).trim();

    this.sendingId.set(id);
    try {
      const ok = await this.contactService.replyToMessage(id, { message: body, subject });
      if (ok) {
        this.toastService.success('Réponse envoyée');
        // Marquer comme lu si besoin
        if (!msg.isRead) {
          await this.markAsRead(msg);
        }
        this.clearReply(id);
      } else {
        this.toastService.danger("Échec de l'envoi de la réponse");
      }
    } finally {
      this.sendingId.set(null);
    }
  }
}
