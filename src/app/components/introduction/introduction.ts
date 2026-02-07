import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-introduction',
  template: `
    <section class="introduction" aria-labelledby="intro-heading">
      <div class="introduction__content">
        <h1 id="intro-heading" class="introduction__title">
          {{ 'introduction.title' | translate }}
        </h1>
        <p class="introduction__subtitle">
          {{ 'introduction.subtitle' | translate }}
        </p>
      </div>
      <div class="introduction__background" aria-hidden="true"></div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class IntroductionComponent {}
