import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environment';
import { ContactForm } from '@features/contact/interface/contact.interface';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  readonly status = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');
  private readonly http = inject(HttpClient);

  async sendMail(payload: ContactForm): Promise<boolean> {
    this.status.set('sending');

    const requestBody = {
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
    };

    try {
      const response = await firstValueFrom(
        this.http.post<ContactMessage>(`${environment.apiUrl}/contact`, requestBody, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      if (response?.id) {
        this.status.set('sent');
        return true;
      } else {
        console.error('Erreur de réponse:', response);
        this.status.set('error');
        return false;
      }
    } catch (err) {
      console.error("Erreur d'envoi:", err);
      this.status.set('error');
      return false;
    }
  }

  async getContacts(): Promise<ContactMessage[]> {
    try {
      return await firstValueFrom(this.http.get<ContactMessage[]>(`${environment.apiUrl}/contact`));
    } catch (err) {
      console.error('Erreur lors de la récupération des contacts:', err);
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ count: number }>(`${environment.apiUrl}/contact/unread-count`),
      );
      return response.count;
    } catch (err) {
      console.error('Erreur lors de la récupération du nombre de messages non lus:', err);
      return 0;
    }
  }

  async getContact(id: string): Promise<ContactMessage | null> {
    try {
      return await firstValueFrom(
        this.http.get<ContactMessage>(`${environment.apiUrl}/contact/${id}`),
      );
    } catch (err) {
      console.error('Erreur lors de la récupération du contact:', err);
      return null;
    }
  }

  async markAsRead(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.put(`${environment.apiUrl}/contact/${id}/read`, {}));
      return true;
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
      return false;
    }
  }

  async deleteContact(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/contact/${id}`));

      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du contact:', err);
      return false;
    }
  }
}
