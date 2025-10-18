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
      <span class="text-text font-bold uppercase tracking-120">Développeur</span>

      <!-- Zone animée avec réservation d'espace -->
      <div class="relative inline-flex items-center">
        <!-- Espace réservé invisible -->
        <span class="opacity-0 pointer-events-none whitespace-nowrap" aria-hidden="true">
          {{ longestPhrase() }}
        </span>
        <span class="opacity-0 pointer-events-none inline-block h-caret-h w-caret" aria-hidden="true"></span>

        <!-- Texte animé visible -->
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
      'inline-flex items-center justify-center text-center text-accent font-bold uppercase tracking-120 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl',
  },
})
export class TypewriterComponent implements OnInit, OnDestroy {
  private readonly phrases = ['Angular', 'NestJS', 'Fullstack'] as const;

  readonly longestPhrase = computed(() => {
    return this.phrases.reduce(
      (longest, phrase) => (phrase.length > longest.length ? phrase : longest),
      this.phrases[0],
    );
  });

  readonly displayedText = signal<string>('');
  readonly reduceMotion = signal(false);

  private readonly typingDelay = 95;
  private readonly deletingDelay = 60;
  private readonly pauseDelay = 900;
  private readonly transitionPauseDelay = 260;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

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
        this.displayedText.set(this.phrases[0]);
      } else {
        this.resetState();
        this.startAnimation();
      }

      this.cdr.markForCheck();
    });
  };

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.reduceMotion.set(true);
      this.displayedText.set(this.phrases[0]);
      return;
    }

    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const shouldReduce = this.mediaQuery.matches;
    this.reduceMotion.set(shouldReduce);

    if (shouldReduce) {
      this.displayedText.set(this.phrases[0]);
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
    if (this.reduceMotion()) return;

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
    this.cdr.markForCheck();
  }

  private scheduleNextFrame(): void {
    if (this.animationFrameId !== null || this.reduceMotion()) return;

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
      const currentPhrase = this.phrases[this.wordIndex];
      const currentDelay = this.isDeleting ? this.deletingDelay : this.typingDelay;
      this.accumulatedTime += delta;

      while (this.accumulatedTime >= currentDelay) {
        this.accumulatedTime -= currentDelay;

        if (!this.isDeleting) {
          if (this.charIndex < currentPhrase.length) {
            this.charIndex++;
            this.publishText(currentPhrase.slice(0, this.charIndex));
          } else {
            this.isDeleting = true;
            this.pauseRemaining = this.pauseDelay;
            this.accumulatedTime = 0;
            break;
          }
        } else if (this.charIndex > 0) {
          this.charIndex--;
          this.publishText(currentPhrase.slice(0, this.charIndex));
        } else {
          this.isDeleting = false;
          this.wordIndex = (this.wordIndex + 1) % this.phrases.length;
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
      this.cdr.markForCheck();
    });
  }
}
