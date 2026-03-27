import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

@Component({
  selector: 'app-turnstile',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="turnstile-wrapper"><div #widgetContainer></div></div>`,
  styles: [`
    .turnstile-wrapper {
      display: flex;
      justify-content: center;
      margin: 1rem 0 0.5rem;
    }
  `]
})
export class TurnstileComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() siteKey = '';
  @Input() action = 'submit';
  @Output() tokenChange = new EventEmitter<string>();
  @ViewChild('widgetContainer', { static: true }) widgetContainer!: ElementRef<HTMLElement>;

  private static scriptLoadingPromise: Promise<void> | null = null;
  private widgetId: string | null = null;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderIfReady();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['siteKey'] || changes['action']) && this.viewReady) {
      this.renderIfReady(true);
    }
  }

  ngOnDestroy(): void {
    if (this.widgetId && window.turnstile) {
      window.turnstile.remove(this.widgetId);
    }
  }

  reset(): void {
    if (this.widgetId && window.turnstile) {
      window.turnstile.reset(this.widgetId);
    }
    this.tokenChange.emit('');
  }

  private async renderIfReady(force = false): Promise<void> {
    if (!this.siteKey) {
      return;
    }

    await this.ensureScriptLoaded();

    if (!window.turnstile) {
      return;
    }

    if (force && this.widgetId) {
      window.turnstile.remove(this.widgetId);
      this.widgetId = null;
      this.widgetContainer.nativeElement.innerHTML = '';
    }

    if (!this.widgetId) {
      this.widgetId = window.turnstile.render(this.widgetContainer.nativeElement, {
        sitekey: this.siteKey,
        action: this.action,
        callback: (token: string) => this.tokenChange.emit(token),
        'expired-callback': () => this.tokenChange.emit(''),
        'error-callback': () => this.tokenChange.emit('')
      });
    }
  }

  private ensureScriptLoaded(): Promise<void> {
    if (window.turnstile) {
      return Promise.resolve();
    }

    if (!TurnstileComponent.scriptLoadingPromise) {
      TurnstileComponent.scriptLoadingPromise = new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector('script[data-turnstile="true"]') as HTMLScriptElement | null;
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(), { once: true });
          existingScript.addEventListener('error', () => reject(new Error('Turnstile script load failed')), { once: true });
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.dataset['turnstile'] = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Turnstile script load failed'));
        document.head.appendChild(script);
      });
    }

    return TurnstileComponent.scriptLoadingPromise;
  }
}
