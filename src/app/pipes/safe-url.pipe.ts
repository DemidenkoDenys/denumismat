import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true,
  pure: true
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeResourceUrl {
    if (!value) {
      return '' as any;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
