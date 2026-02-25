import { Component, ChangeDetectionStrategy, input, Inject, inject, signal } from '@angular/core';
import { AuthModalService } from '../../services/auth-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-introduction',
  template: `
    <section class="introduction" aria-labelledby="intro-heading">
      <div class="introduction__content">
        <h1 id="intro-heading" class="introduction__title">
          {{ 'introduction.title' | translate }}
          @if (isAdmin()) {
            <span class="introduction__admin-badge">admin</span>
          }
        </h1>
        <p class="introduction__subtitle">{{ 'introduction.subtitle' | translate }}</p>
        <p class="introduction__subtitle" [innerHTML]="'introduction.subtitle2' | translate"></p>
        <p class="introduction__subtitle">
          <span>{{ 'introduction.subtitle3_1' | translate }}</span>
          <a href="https://www.vatera.hu/listings/index.php?us=Denumizmat" target="_blank" rel="noopener noreferrer">Vatera</a>,
          <a href="https://galeriasavaria.hu/en/felhasznalo/Denumismat/termekek/" target="_blank" rel="noopener noreferrer">Galéria Savaria</a>,
          <a href="https://aukro.hu/felhasznalo/denumismat/ajanlatok" target="_blank" rel="noopener noreferrer">Aukro</a>

          <svg fill="currentColor" class="introduction-warning" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" >
            <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
            <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
          </svg>
          <span class="tooltip top">{{ 'introduction.subtitleAlert' | translate }}</span>

          <small class="highlight"> {{ 'introduction.subtitle3_2' | translate }}</small>
        </p>

        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="introduction__question-sticky" viewBox="0 0 16 16" (click)="openInstruction()">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
          <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
        </svg>

        <svg fill="currentColor" class="introduction__warning-sticky" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" (click)="openWarnings()">
          <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
          <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
        </svg>
        <span class="tooltip top">{{ 'introduction.subtitleAlert' | translate }}</span>
      </div>
      <div class="introduction__background" aria-hidden="true"></div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class IntroductionComponent {
  toast = inject(ToastService);
  isAdmin = input(false);
  isLoggedIn = input(false);
  warningInViewport = signal(false);

  constructor(@Inject(AuthModalService) private authModal: AuthModalService) { }

  openAuth(event: Event) {
    event.preventDefault();
    this.authModal.showAuthModal();
  }

  openWarnings() {
    this.toast.error('introduction.subtitleAlert', 20000);
  }

  openInstruction() {
    this.toast.info('toast.welcome', 20000);
  }
}
