import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="page-footer" role="contentinfo">
      <div class="page-footer__inner">
        <section class="page-footer__section">
          <h3 class="page-footer__title">{{ 'pageFooter.aboutTitle' | translate }}</h3>
          <p class="page-footer__text"><span class="page-footer__brand">Denumismat</span> {{ 'pageFooter.aboutText' | translate }}</p>
          <p class="page-footer__text">{{ 'pageFooter.aboutTextAdditional' | translate }}</p>
          <div class="page-footer__links">
            <a href="https://galeriasavaria.hu/en/felhasznalo/Denumismat/termekek/" target="_blank" rel="noopener noreferrer" class="page-footer__link">{{ 'pageFooter.linkGaleriaSavaria' | translate }}</a>
            <a href="https://www.vatera.hu/listings/index.php?us=Denumizmat" target="_blank" rel="noopener noreferrer" class="page-footer__link">{{ 'pageFooter.linkVatera' | translate }}</a>
            <a href="https://aukro.hu/felhasznalo/denumismat/ajanlatok" target="_blank" rel="noopener noreferrer" class="page-footer__link">{{ 'pageFooter.linkAukro' | translate }}</a>
          </div>

          <div class="page-footer__links">
            <a href="mailto:denumismat@gmail.com" class="page-footer__link">denumismat@gmail.com</a>
          </div>
        </section>

        <section class="page-footer__section">
          <h3 class="page-footer__title">{{ 'pageFooter.infoTitle' | translate }}</h3>

          <p class="page-footer__text">{{ 'pageFooter.iOffer' | translate }}<br>
            {{ 'pageFooter.iOffer2' | translate }}<br>
            {{ 'pageFooter.packing' | translate }}<br><br>
            <span class="page-footer__highlight">{{ 'pageFooter.noTraceableGreen' | translate }}</span>&nbsp;
            {{ 'pageFooter.noTraceableRest' | translate }}
            <span class="page-footer__alert">{{ 'pageFooter.noTraceableAlert' | translate }}</span>&nbsp;
            <span class="page-footer__highlight">{{ 'pageFooter.noTraceableProof' | translate }}</span>
          </p>

          <div class="page-footer__section-shipping">
            <h3 class="page-footer__title">{{ 'pageFooter.mapTitle' | translate }}</h3>
            <div class="page-footer__map">
              <iframe
                title="{{ 'pageFooter.mapTitle' | translate }}"
                src="https://www.google.com/maps?q=Budapest%2013%20district&z=13&output=embed"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>
        </section>

        <section class="page-footer__section">
          <h3 class="page-footer__title">{{ 'pageFooter.termsTitle' | translate }}</h3>
          <p class="page-footer__text">{{ 'pageFooter.termsBooking' | translate }}</p>
          <p class="page-footer__text">{{ 'pageFooter.termsOrder' | translate }}</p>

          <p class="page-footer__text">
            <span class="page-footer__text--warning">{{ 'pageFooter.termsAlert' | translate }}</span>
            {{ 'pageFooter.termsWarning' | translate }}
            <span class="page-footer__highlight">{{ 'pageFooter.termsGreen' | translate }}</span>
          </p>

          <p class="page-footer__text page-footer__text--warning">{{ 'pageFooter.termsCondition' | translate }}</p>

          <p class="page-footer__alert page-footer__usa">{{ 'pageFooter.usaDeliveryShort' | translate }}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
            </svg>

            <span class="tooltip top" role="tooltip">{{ 'pageFooter.usaDeliveryFull' | translate }}</span>
          </p>
        </section>
      </div>
    </footer>
  `,
})
export class FooterComponent { }
