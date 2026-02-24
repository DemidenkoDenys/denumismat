import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Converts a number of days into a human‑readable "time ago" string.
 *
 * - 0‑6 days: translated days value
 * - 7‑13 days: translated weeks value (1 week)
 * - 14+ days: translated weeks value (>1 weeks)
 *
 * Translation keys (ICU plural forms) should be defined in the i18n JSON
 * files: `time.daysAgo` and `time.weeksAgo`.
 */
@Pipe({
  name: 'daysAgo',
  standalone: true,
  pure: true,
})
export class DaysAgoPipe implements PipeTransform {
  private translate = inject(TranslateService);

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    let days: number;
    if (typeof value === 'string') {
      // attempt to extract digits from the string (e.g. "DATE: 5")
      const match = value.match(/\d+/);
      if (match) {
        days = Number(match[0]);
      } else {
        return '';
      }
    } else {
      days = value;
    }

    if (isNaN(days)) {
      return '';
    }

    const d = Math.round(days);

    if (d < 7) {
      return d + this.translate.instant('time.days');
    }

    if (d === 7) {
      return '1 ' + this.translate.instant('time.week');
    }

    const weeks = Math.round(d / 7);
    return weeks + ' ' + this.translate.instant('time.weeks');
  }
}
