import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-typewriter',
  template: `
    <div class="inline-flex items-center justify-center gap-2 sm:gap-3" aria-live="polite">
      <!-- Développeur - fixe, ne bouge jamais -->
      <span class="text-text font-bold uppercase tracking-120">{{ title() }}</span>

      <!-- Zone animée avec réservation d'espace -->
      <div class="relative inline-flex items-center">
        <!-- Espace réservé invisible (mot le plus long + curseur) -->
        <span class="opacity-0 pointer-events-none whitespace-nowrap" aria-hidden="true">
          {{ longestPhrase() }}
        </span>
        <span
          class="opacity-0 pointer-events-none inline-block h-caret-h w-caret"
          aria-hidden="true"
        ></span>

        <!-- Texte animé visible superposé -->
        <div class="absolute left-0 top-0 inline-flex items-center">
          <span class="whitespace-nowrap">{{ displayedText() }}</span>
          <span
            class="inline-block h-caret-h w-caret bg-accent ml-0.5"
            [class.opacity-100]="!reduceMotion()"
            [class.opacity-0]="reduceMotion()"
            [class.animate-pulse]="!reduceMotion()"
            aria-hidden="true"
          ></span>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'inline-flex items-center justify-center text-center text-accent font-bold uppercase tracking-120 text-lg sm:text-xl md:text-2xl lg:text-3xl',
  },
})
export class TypewriterComponent implements OnInit, OnDestroy {
  readonly title = computed(() => 'Développeur');

  private readonly defaultPhrases = ['Angular', 'NestJS', 'Fullstack'] as const;

  protected readonly phrases = computed<readonly string[]>(() => {
    return [...this.defaultPhrases];
  });

  protected readonly longestPhrase = computed(() => {
    const list = this.phrases();
    if (list.length === 0) {
      return '';
    }

    return list.reduce(
      (longest, phrase) => (phrase.length > longest.length ? phrase : longest),
      list[0],
    );
  });

  protected readonly displayedText = signal<string>('');
  protected readonly reduceMotion = signal(false);

  private readonly typingDelay = 95;
  private readonly deletingDelay = 60;
  private readonly pauseDelay = 900;
  private readonly transitionPauseDelay = 260;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly phrasesSnapshot = signal<readonly string[]>(this.defaultPhrases);

  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private pauseRemaining = 0;
  private accumulatedTime = 0;
  private lastFrameTimestamp: number | null = null;
  private animationFrameId: number | null = null;
  private mediaQuery: MediaQueryList | null = null;

  private readonly handleMotionPreferenceChange = (event: MediaQueryListEvent): void => {
    this.ngZone.run(() => {
      this.reduceMotion.set(event.matches);

      if (event.matches) {
        this.stopAnimation();
        const phrases = this.phrases();
        this.phrasesSnapshot.set(phrases);
        this.displayedText.set(phrases[0] ?? '');
      } else {
        this.resetState();
        this.startAnimation();
      }

      this.changeDetectorRef.markForCheck();
    });
  };

  ngOnInit(): void {
    const phrases = this.phrases();
    this.phrasesSnapshot.set(phrases);

    if (!isPlatformBrowser(this.platformId)) {
      this.reduceMotion.set(true);
      this.displayedText.set(phrases[0] ?? '');
      return;
    }

    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const shouldReduce = this.mediaQuery.matches;
    this.reduceMotion.set(shouldReduce);

    if (shouldReduce) {
      this.displayedText.set(phrases[0] ?? '');
      return;
    }

    this.mediaQuery.addEventListener('change', this.handleMotionPreferenceChange);
    this.resetState();
    this.startAnimation();
  }

  ngOnDestroy(): void {
    this.stopAnimation();

    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleMotionPreferenceChange);
      this.mediaQuery = null;
    }
  }

  private startAnimation(): void {
    if (this.reduceMotion()) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.scheduleNextFrame();
    });
  }

  private stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private resetState(): void {
    this.stopAnimation();
    this.wordIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.pauseRemaining = 0;
    this.accumulatedTime = 0;
    this.lastFrameTimestamp = null;
    this.displayedText.set('');
    this.changeDetectorRef.markForCheck();
  }

  private scheduleNextFrame(): void {
    if (this.animationFrameId !== null || this.reduceMotion()) {
      return;
    }

    this.animationFrameId = requestAnimationFrame((timestamp) =>
      this.handleTypewriterFrame(timestamp),
    );
  }

  private handleTypewriterFrame(timestamp: number): void {
    this.animationFrameId = null;

    this.lastFrameTimestamp ??= timestamp;

    const delta = timestamp - this.lastFrameTimestamp;
    this.lastFrameTimestamp = timestamp;

    if (this.pauseRemaining > 0) {
      this.pauseRemaining = Math.max(this.pauseRemaining - delta, 0);
    } else {
      const latestPhrases = this.phrases();
      if (latestPhrases !== this.phrasesSnapshot()) {
        this.phrasesSnapshot.set(latestPhrases);
        this.wordIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
      }

      const phrases = this.phrasesSnapshot();
      const total = phrases.length;
      if (total === 0) {
        return;
      }

      if (this.wordIndex >= total) {
        this.wordIndex = 0;
        this.charIndex = 0;
      }

      const currentPhrase = phrases[this.wordIndex];
      const currentDelay = this.isDeleting ? this.deletingDelay : this.typingDelay;
      this.accumulatedTime += delta;

      while (this.accumulatedTime >= currentDelay) {
        this.accumulatedTime -= currentDelay;

        if (!this.isDeleting) {
          if (this.charIndex < currentPhrase.length) {
            this.charIndex += 1;
            this.publishText(currentPhrase.slice(0, this.charIndex));
          } else {
            this.isDeleting = true;
            this.pauseRemaining = this.pauseDelay;
            this.accumulatedTime = 0;
            break;
          }
        } else if (this.charIndex > 0) {
          this.charIndex -= 1;
          this.publishText(currentPhrase.slice(0, this.charIndex));
        } else {
          this.isDeleting = false;
          this.wordIndex = (this.wordIndex + 1) % total;
          this.pauseRemaining = this.transitionPauseDelay;
          this.accumulatedTime = 0;
          break;
        }
      }
    }

    this.scheduleNextFrame();
  }

  private publishText(text: string): void {
    this.ngZone.run(() => {
      this.displayedText.set(text);
      this.changeDetectorRef.markForCheck();
    });
  }
}
