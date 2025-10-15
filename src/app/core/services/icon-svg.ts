import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class IconSvg {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT, { optional: true });
  private readonly spriteCache = new Map<string, string>();
  private readonly loadingSprites = new Map<string, Observable<string>>();
  private readonly defaultSpriteUrl = '/sprite.svg';

  constructor() {
    // Préchargement automatique du sprite par défaut pour éviter les latences
    this.preloadDefaultSprite();
  }

  /**
   * Précharge le sprite SVG par défaut pour améliorer les performances
   * et éviter les latences lors de la navigation
   */
  preloadDefaultSprite(): void {
    setTimeout(() => this.loadSprite(this.defaultSpriteUrl), 0);
  }

  loadSprite(url: string): Observable<string> {
    // Vérifier le cache
    if (this.spriteCache.has(url)) {
      return of(this.spriteCache.get(url)!);
    }

    // Vérifier si déjà en cours de chargement
    if (this.loadingSprites.has(url)) {
      return this.loadingSprites.get(url)!;
    }

    // Utiliser priority: 'high' pour charger le sprite en priorité
    const loading$ = this.http
      .get(url, {
        responseType: 'text',
        headers: { 'X-Priority': 'high' },
      })
      .pipe(
        tap((sprite) => {
          this.spriteCache.set(url, sprite);
          this.loadingSprites.delete(url);
          this.injectSprite(url, sprite);
        }),
      );

    this.loadingSprites.set(url, loading$);
    return loading$;
  }

  private injectSprite(url: string, sprite: string): void {
    const doc = this.document;
    const body = doc?.body;
    if (!body) {
      return; // SSR: pas de document disponible
    }

    // Éviter les doublons si le sprite est déjà injecté
    const existing = body.querySelector<HTMLDivElement>(`div[data-svg-sprite="${url}"]`);
    if (existing) {
      return;
    }

    const container = doc.createElement('div');
    container.setAttribute('data-svg-sprite', url);
    container.style.display = 'none';
    container.innerHTML = sprite;
    body.appendChild(container);
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
