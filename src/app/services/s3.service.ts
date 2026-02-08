import { Injectable } from '@angular/core';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME, AWS_REGION } from '../config/s3.config';
import { from, Observable, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

/**
 * S3Service
 *
 * Service for loading images and other assets from AWS S3 bucket
 * Provides methods to get signed URLs and load images efficiently
 */
@Injectable({ providedIn: 'root' })
export class S3Service {
  private readonly region: string = AWS_REGION;
  private readonly bucketName: string = S3_BUCKET_NAME;
  private readonly DEBUG_LOGGING = false; // Set to true to enable AWS image loading logs

  private imageCache = new Map<string, string>();

  constructor() { }

  /**
   * Get signed URL for a coin image (for private buckets)
   * @param coinId - The unique identifier for the coin
   * @param filename - Optional custom filename, defaults to coinId.jpeg
   * @returns Observable of signed URL
   */
  getCoinImageUrlSigned(coinId: string, filename?: string): Observable<string> {
    const Key = `${filename || `coins/${coinId}.JPEG`}`;
    const Bucket = this.bucketName;

    // Check cache first
    if (this.imageCache.has(Key)) {
      return of(this.imageCache.get(Key)!);
    }

    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseCacheControl: 'public, max-age=31536000, immutable'
    });

    // Generate signed URL valid for 7 days with cache control
    return from(getSignedUrl(s3Client, command, { expiresIn: 604800 })).pipe(
      map(url => {
        this.imageCache.set(Key, url);
        return url;
      }),
      catchError(error => {
        console.error('Error generating signed URL:', error);
        return of('');
      })
    );
  }

  /**
   * Get the full S3 URL for a coin image (for public buckets)
   * @param coinId - The unique identifier for the coin
   * @param filename - Optional custom filename, defaults to coinId.jpeg
   * @returns Full S3 URL for the image
   */
  getCoinImageUrl(coinId: string, filename?: string): string {
    const Key = filename || `${coinId}.JPEG`;
    // Use regional endpoint for proper S3 access
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/coins/${Key}`;
  }

  /**
   * Get a signed URL for a private S3 object
   * @param key - The S3 object key (path)
   * @param expiresIn - URL expiration time in seconds (default: 3600)
   * @returns Observable of the signed URL
   */
  getSignedUrl(key: string, expiresIn: number = 3600): Observable<string> {
    // Check cache first
    if (this.imageCache.has(key)) {
      // console.log('✅ Cache HIT (in-memory):', key);
      return of(this.imageCache.get(key)!);
    }

    // console.log('❌ Cache MISS - Generating signed URL for:', key);
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ResponseCacheControl: 'public, max-age=31536000, immutable'
    });

    return from(getSignedUrl(s3Client, command, { expiresIn })).pipe(
      map(url => {
        // console.log('💾 Cached signed URL for:', key);
        // console.log('🌐 Browser will cache image with: Cache-Control: public, max-age=31536000, immutable');
        this.imageCache.set(key, url);
        return url;
      }),
      catchError(error => {
        console.error('Error generating signed URL:', error);
        return of('');
      })
    );
  }

  /**
   * Load image as blob from S3
   * Useful for displaying images that require authentication
   * @param key - The S3 object key
   * @returns Observable of Blob
   */
  loadImageBlob(key: string): Observable<Blob | null> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ResponseCacheControl: 'public, max-age=31536000, immutable'
    });

    return from(s3Client.send(command)).pipe(
      map(response => {
        if (response.Body) {
          // Convert the response body to Blob
          return response.Body as Blob;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error loading image from S3:', error);
        return of(null);
      })
    );
  }

  /**
   * Preload multiple images
   * @param keys - Array of S3 object keys
   * @returns Observable of loaded URLs
   */
  preloadImages(keys: string[]): Observable<string[]> {
    const urls = keys.map(key => this.getCoinImageUrl(key));

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
   * @returns Thumbnail URL
   */
  getCoinThumbnailUrl(coinId: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/coins/thumbnails/${coinId}_thumb.jpeg`;
  }

  /**
   * Get high resolution URL for a coin
   * @param coinId - The unique identifier for the coin
   * @returns High resolution image URL
   */
  getCoinHighResUrl(coinId: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/coins/highres/${coinId}_highres.jpeg`;
  }

  /**
   * Get all images from a coin folder
   * @param coinId - The unique identifier for the coin
   * @returns Observable of array of signed URLs for all images in the folder
   */
  getCoinFolderImages(coinId: string): Observable<string[]> {
    const prefix = `coins/${coinId}/`;
    // console.log(`📁 Loading images for coin folder: ${coinId}`);

    const listCommand = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix
    });

    return from(s3Client.send(listCommand)).pipe(
      switchMap(response => {
        if (!response.Contents || response.Contents.length === 0) {
          // console.log(`⚠️  No images found in folder: ${coinId}`);
          return of([]);
        }

        // Filter out any non-image files and get signed URLs for each
        const imageKeys = response.Contents
          .filter(item => item.Key && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.Key))
          .map(item => item.Key!);

        if (imageKeys.length === 0) {
          // console.log(`⚠️  No image files found in folder: ${coinId}`);
          return of([]);
        }

        // console.log(`🖼️  Found ${imageKeys.length} image(s) in folder ${coinId}`);

        // Get signed URLs for all images (getSignedUrl handles caching)
        const signedUrlObservables = imageKeys.map(key => this.getSignedUrl(key));
        return forkJoin(signedUrlObservables);
      }),
      catchError(error => {
        console.error(`❌ Error listing images for coin ${coinId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get list of image keys from a coin folder (without loading them)
   * @param coinId - The unique identifier for the coin
   * @returns Observable of array of S3 keys for images in the folder
   */
  getCoinFolderImageKeys(coinId: string): Observable<string[]> {
    const prefix = `coins/${coinId}/`;
    // console.log(`📋 Listing image keys for coin folder: ${coinId}`);

    const listCommand = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix
    });

    return from(s3Client.send(listCommand)).pipe(
      map(response => {
        if (!response.Contents || response.Contents.length === 0) {
          // console.log(`⚠️  No images found in folder: ${coinId}`);
          return [];
        }

        // Filter out any non-image files
        const imageKeys = response.Contents
          .filter(item => item.Key && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.Key))
          .map(item => item.Key!);

        if (imageKeys.length === 0) {
          // console.log(`⚠️  No image files found in folder: ${coinId}`);
          return [];
        }

        // console.log(`📸 Found ${imageKeys.length} image key(s) in folder ${coinId}`);
        return imageKeys;
      }),
      catchError(error => {
        console.error(`❌ Error listing image keys for coin ${coinId}:`, error);
        return of([]);
      })
    );
  }
}
