import { Injectable } from '@angular/core';
import { CLOUDFRONT_DOMAIN_URL } from '../config/s3.config';
import { Observable, of } from 'rxjs';

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
  private readonly DEBUG_LOGGING = true; // Set to true to enable image loading logs

  private imageCache = new Map<string, string>();

  constructor() { }

  /**
   * Get CloudFront URL for a coin image
   * @param coinId - The unique identifier for the coin
   * @param filename - Optional custom filename, defaults to coinId.jpeg
   * @returns Direct CloudFront URL
   */
  getCoinImageUrlSigned(coinId: string, filename?: string): Observable<string> {
    const path = filename || `coins/${coinId}.JPEG`;
    const url = `${this.cloudFrontUrl}/${path}`;

    return of(url);
  }

  /**
   * Get the full CloudFront URL for a coin image
   * @param coinId - The unique identifier for the coin
   * @param filename - Optional custom filename, defaults to coinId.jpeg
   * @returns Full CloudFront URL for the image
   */
  getCoinImageUrl(coinId: string, filename?: string): string {
    const path = filename || `coins/${coinId}.JPEG`;
    return `${this.cloudFrontUrl}/${path}`;
  }

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
   * Preload multiple images
   * @param paths - Array of image paths relative to CloudFront root
   * @returns Observable of loaded URLs
   */
  preloadImages(paths: string[]): Observable<string[]> {
    const urls = paths.map(path => `${this.cloudFrontUrl}/${path}`);

    // Preload images in the browser
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });

    return of(urls);
  }

  /**
   * Clear the image cache
   */
  clearCache(): void {
    this.imageCache.clear();
  }

  /**
   * Get thumbnail URL for a coin
   * @param coinId - The unique identifier for the coin
   * @returns CloudFront thumbnail URL
   */
  getCoinThumbnailUrl(coinId: string): string {
    return `${this.cloudFrontUrl}/coins/thumbnails/${coinId}_thumb.jpeg`;
  }

  /**
   * Get high resolution URL for a coin
   * @param coinId - The unique identifier for the coin
   * @returns CloudFront high resolution image URL
   */
  getCoinHighResUrl(coinId: string): string {
    return `${this.cloudFrontUrl}/coins/highres/${coinId}_highres.jpeg`;
  }

  /**
   * Get all images from a coin folder based on provided filenames
   * @param coinId - The unique identifier for the coin
   * @param imageFilenames - Optional array of image filenames from Firestore
   * @returns Observable of array of CloudFront URLs for all images in the folder
   */
  getCoinFolderImages(coinId: string, imageFilenames?: string[]): Observable<string[]> {
    // If image filenames are provided from Firestore, use them
    if (imageFilenames && imageFilenames.length > 0) {
      const urls = imageFilenames.map(filename => {
        const key = `coins/${coinId}/${filename}`;
        const url = `${this.cloudFrontUrl}/${key}`;
        this.imageCache.set(key, url);
        return url;
      });
      return of(urls);
    }

    // Fallback: Try sequential naming convention (image-0.jpg, image-1.jpg, etc.)
    // Return at least the first potential image
    const defaultImages = [
      `${this.cloudFrontUrl}/coins/${coinId}/image-0.jpg`,
      `${this.cloudFrontUrl}/coins/${coinId}/image-1.jpg`,
      `${this.cloudFrontUrl}/coins/${coinId}/image-2.jpg`,
      `${this.cloudFrontUrl}/coins/${coinId}/image-3.jpg`,
      `${this.cloudFrontUrl}/coins/${coinId}/image-4.jpg`
    ];

    return of(defaultImages);
  }

  /**
   * Get list of image keys from a coin folder
   * Images are named: 1.jpeg, 2.jpeg, 3.jpeg, 4.jpeg (up to 4 images per coin)
   * @param coinId - The unique identifier for the coin
   * @param imageFilenames - Optional array of image filenames from Firestore (ignored)
   * @returns Observable of array of paths for images in the folder
   */
  getCoinFolderImageKeys(coinId: string, imageFilenames?: string[]): Observable<string[]> {
    // Fixed naming pattern: 1.jpeg, 2.jpeg, 3.jpeg, 4.jpeg
    const imageKeys = [
      `${coinId}/1.JPEG`,
      `${coinId}/2.JPEG`,
      `${coinId}/3.JPEG`,
      `${coinId}/4.JPEG`
    ];

    return of(imageKeys);
  }
}
