import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LiveAnnouncerService {
  private readonly document = inject(DOCUMENT);
  private liveElement?: HTMLElement;

  constructor() {
    this.createLiveRegion();
  }

  /**
   * Crée la région live pour les annonces d'accessibilité
   */
  private createLiveRegion(): void {
    if (this.liveElement || !this.document) return;

    this.liveElement = this.document.createElement('div');
    this.liveElement.setAttribute('id', 'a11y-live-region');
    this.liveElement.setAttribute('aria-live', 'polite');
    this.liveElement.setAttribute('aria-atomic', 'true');
    this.liveElement.setAttribute('aria-relevant', 'additions text');
    this.liveElement.className = 'sr-only';
    
    // Ajout au body
    this.document.body.appendChild(this.liveElement);
  }

  /**
   * Annonce un message avec priorité normale (aria-live="polite")
   */
  announce(message: string): void {
    this.setMessage(message, 'polite');
  }

  /**
   * Annonce un message avec priorité haute (aria-live="assertive")
   * À utiliser pour les erreurs critiques ou alertes importantes
   */
  announceUrgent(message: string): void {
    this.setMessage(message, 'assertive');
  }

  /**
   * Annonce une navigation de page
   */
  announceNavigation(pageName: string): void {
    this.announce(`Page ${pageName} chargée`);
  }

  /**
   * Annonce un changement d'état de formulaire
   */
  announceFormStatus(status: 'success' | 'error', message: string): void {
    if (status === 'error') {
      this.announceUrgent(`Erreur : ${message}`);
    } else {
      this.announce(`Succès : ${message}`);
    }
  }

  /**
   * Annonce le chargement ou la fin de chargement
   */
  announceLoading(isLoading: boolean, context?: string): void {
    if (isLoading) {
      this.announce(`Chargement${context ? ` ${context}` : ''}...`);
    } else {
      this.announce(`Chargement terminé${context ? ` ${context}` : ''}`);
    }
  }

  private setMessage(message: string, priority: 'polite' | 'assertive'): void {
    if (!this.liveElement || !message.trim()) return;

    // Changer la priorité si nécessaire
    if (this.liveElement.getAttribute('aria-live') !== priority) {
      this.liveElement.setAttribute('aria-live', priority);
    }

    // Effacer le message précédent puis ajouter le nouveau
    // Cette technique assure que le lecteur d'écran lira le nouveau message
    this.liveElement.textContent = '';
    
    setTimeout(() => {
      if (this.liveElement) {
        this.liveElement.textContent = message;
      }
    }, 50);

    // Nettoyer après 5 secondes
    setTimeout(() => {
      if (this.liveElement) {
        this.liveElement.textContent = '';
      }
    }, 5000);
  }
}