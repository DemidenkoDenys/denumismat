import { Injectable } from '@angular/core';
import { CLOUDFRONT_DOMAIN_URL } from '../config/s3.config';
import { from, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

/**
 * CloudFrontService (formerly S3Service)
 *
 * Service for loading images from CloudFront CDN
 * Provides methods to construct direct CloudFront URLs without requiring AWS credentials
 * All images are served publicly through CloudFront for better performance and security
 */
@Injectable({ providedIn: 'root' })
export class S3Service {
  private readonly cloudFrontUrl: string = CLOUDFRONT_DOMAIN_URL;

  private imageCache = new Map<string, string>();

  constructor(private http: HttpClient) { }

  /**
   * Get a direct CloudFront URL for an image
   * @param key - The image path/key (e.g., 'coins/123/image-0.jpg')
   * @returns Observable of the CloudFront URL
   */
  getSignedUrl(key: string): Observable<string> {
    // Check cache first
    if (this.imageCache.has(key)) {
      return of(this.imageCache.get(key)!);
    }

    const url = `${this.cloudFrontUrl}/${key}`;
    this.imageCache.set(key, url);
    return of(url);
  }

  /**
   * Clear the image cache
   */
  clearCache(): void {
    this.imageCache.clear();
  }

  getCoinFolderFilenames() {
    return this.http.get('https://denumismat.s3.eu-central-1.amazonaws.com/s3-structure.json');
  }
}
