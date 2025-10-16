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

    // Vérifier si le sprite est déjà injecté (par le script au build ou précédemment)
    const svgSpriteContainer = doc.getElementById('svg-sprite-container');
    if (svgSpriteContainer && svgSpriteContainer.children.length > 0) {
      return; // Le sprite est déjà là
    }

    // Injecter dans le container prévu ou créer un nouveau
    if (svgSpriteContainer) {
      svgSpriteContainer.innerHTML = sprite;
      // Retirer display:none et utiliser position absolute à la place
      svgSpriteContainer.style.position = 'absolute';
      svgSpriteContainer.style.width = '0';
      svgSpriteContainer.style.height = '0';
      svgSpriteContainer.style.overflow = 'hidden';
    } else {
      const container = doc.createElement('div');
      container.setAttribute('id', 'svg-sprite-container');
      container.style.position = 'absolute';
      container.style.width = '0';
      container.style.height = '0';
      container.style.overflow = 'hidden';
      container.innerHTML = sprite;
      body.insertBefore(container, body.firstChild);
    }
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Extrait le SVG d'un <symbol> du sprite et le retourne sous forme de balise <svg> avec viewBox
   */
  getSymbolSvg(symbolId: string, spriteUrl: string = this.defaultSpriteUrl): Observable<string> {
    return new Observable<string>((observer) => {
      const emitSymbol = (sprite: string) => {
        // RegExp sans backslash inutile, mode dotAll pour matcher tout
        const regex = new RegExp(
          `<symbol[^>]*id=["']${symbolId}["'][^>]*viewBox=["']([^"']+)["'][^>]*>(.*)</symbol>`,
          's',
        );
        const match = sprite.match(regex);
        console.log(
          '[IconSvg] Recherche symbolId:',
          symbolId,
          '| Trouvé:',
          !!match,
          '| Contenu:',
          match ? match[2].slice(0, 100) : '---',
        );
        if (match) {
          const viewBox = match[1];
          const content = match[2];
          // Reconstruit le SVG inline avec viewBox
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${content}</svg>`;
          // Si le contenu est vide, fallback
          observer.next(
            content.trim()
              ? svg
              : '<svg width="24" height="24"><rect width="100%" height="100%" fill="orange"/><text x="2" y="16" font-size="10" fill="white">VIDE</text></svg>',
          );
        } else {
          observer.next(
            '<svg width="24" height="24"><rect width="100%" height="100%" fill="red"/><text x="2" y="16" font-size="10" fill="white">SVG?</text></svg>',
          );
        }
        observer.complete();
      };
      // Sprite déjà chargé ?
      if (this.spriteCache.has(spriteUrl)) {
        emitSymbol(this.spriteCache.get(spriteUrl)!);
      } else {
        this.loadSprite(spriteUrl).subscribe(emitSymbol);
      }
    });
  }
}
