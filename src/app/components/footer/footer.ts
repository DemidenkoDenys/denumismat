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
          <p class="page-footer__text">{{ 'pageFooter.aboutText' | translate }}</p>
          <div class="page-footer__links">
            <a href="https://galeriasavaria.hu/en/felhasznalo/Denumismat/termekek/" target="_blank" rel="noopener noreferrer" class="page-footer__link">{{ 'pageFooter.linkGaleriaSavaria' | translate }}</a>
            <a href="https://www.vatera.hu/listings/index.php?us=Denumizmat" target="_blank" rel="noopener noreferrer" class="page-footer__link">{{ 'pageFooter.linkVatera' | translate }}</a>
            <a href="https://aukro.hu/felhasznalo/denumismat/ajanlatok" target="_blank" rel="noopener noreferrer" class="page-footer__link">{{ 'pageFooter.linkAukro' | translate }}</a>
          </div>
        </section>

        <section class="page-footer__section">
        <h3 class="page-footer__title">{{ 'pageFooter.infoTitle' | translate }}</h3>
          <ul class="page-footer__list">
            <li>{{ 'pageFooter.infoItemOne' | translate }}</li>
            <li>{{ 'pageFooter.infoItemTwo' | translate }}</li>
            <li>{{ 'pageFooter.infoItemThree' | translate }}</li>
            <li>{{ 'pageFooter.infoItemFour' | translate }}</li>
          </ul>
        </section>

        <section class="page-footer__section">
          <h3 class="page-footer__title">{{ 'pageFooter.mapTitle' | translate }}</h3>
          <div class="page-footer__map">
            <iframe
              title="{{ 'pageFooter.mapTitle' | translate }}"
              src="https://www.google.com/maps?q=Budapest%2013%20district&z=13&output=embed"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </section>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
