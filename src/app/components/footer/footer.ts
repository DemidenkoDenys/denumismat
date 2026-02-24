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
        </section>

        <section class="page-footer__section">
          <h3 class="page-footer__title">{{ 'pageFooter.infoTitle' | translate }}</h3>

          <p class="page-footer__text">{{ 'pageFooter.iOffer' | translate }}<br>
            {{ 'pageFooter.iOffer2' | translate }}<br>
            {{ 'pageFooter.packing' | translate }}<br><br>
            <span class="page-footer__highlight">{{ 'pageFooter.noTraceableGreen' | translate }}</span>{{ 'pageFooter.noTraceableRest' | translate }}<span class="page-footer__alert">{{ 'pageFooter.noTraceableAlert' | translate }}</span>
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

          <!-- <div class="page-footer__section-shipping-methods">
            <p class="page-footer__text">{{ 'pageFooter.domestic' | translate }}:</p>
            <ul class="page-footer__list">
              @for (method of domesticShippingMethods(); track method?.id) {
                @if (method) {
                  <li>{{ displayMethodLabel(method) }}{{ method.price ? ' - ' : '' }}<span class="page-footer__list__price">{{ method.price ? (method.price | price) : '' }}</span></li>
                }
              }
            </ul>

            <p class="page-footer__text page-footer__text--international">{{ 'pageFooter.international' | translate }}:</p>
            <ul class="page-footer__list">
              @for (method of internationalShippingMethods(); track method?.id) {
                @if (method) {
                  <li>{{ displayMethodLabel(method) }}{{ method.price ? ' - ' : '' }}<span class="page-footer__list__price">{{ method.price ? (method.price | price) : '' }}</span></li>
                }
              }
            </ul>
          </div> -->
        </section>

        <section class="page-footer__section">
          <h3 class="page-footer__title">{{ 'pageFooter.termsTitle' | translate }}</h3>
          <p class="page-footer__text">{{ 'pageFooter.termsBooking' | translate }}</p>
          <p class="page-footer__text">{{ 'pageFooter.termsOrder' | translate }}</p>
          <p class="page-footer__text page-footer__text--warning">{{ 'pageFooter.termsWarning' | translate }}</p>

          <br>
          <h3 class="page-footer__title text-right">Email</h3>
          <div class="page-footer__links">
            <a href="mailto:denumismat@gmail.com" class="page-footer__link ml-auto">denumismat@gmail.com</a>
          </div>
        </section>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
