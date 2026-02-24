import { Component, ChangeDetectionStrategy, input, Inject } from '@angular/core';
import { AuthModalService } from '../../services/auth-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

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
          <a href="https://aukro.hu/felhasznalo/denumismat/ajanlatok" target="_blank" rel="noopener noreferrer">Aukro</a>.
          <small> {{ 'introduction.subtitle3_2' | translate }}</small>
        </p>
      </div>
      <div class="introduction__background" aria-hidden="true"></div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class IntroductionComponent {
  isAdmin = input(false);
  isLoggedIn = input(false);

  constructor(@Inject(AuthModalService) private authModal: AuthModalService) { }

  openAuth(event: Event) {
    event.preventDefault();
    this.authModal.showAuthModal();
  }
}
