import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-introduction',
  template: `
    <section class="introduction" aria-labelledby="intro-heading">
      <div class="introduction__content">
        <h1 id="intro-heading" class="introduction__title">
          Explore Rare & Exquisite Coins
        </h1>
        <p class="introduction__subtitle">
          Discover the world's finest numismatic collections. Browse, filter, and order coins from trusted sellers worldwide.
        </p>
      </div>
      <div class="introduction__background" aria-hidden="true"></div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class IntroductionComponent {}
