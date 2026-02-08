import { environment } from '../../environments/environment';

/**
 * CloudFront Configuration
 * CloudFront CDN domain URL for public image access (no credentials needed)
 */
export const CLOUDFRONT_DOMAIN_URL = environment.cloudFront.domainUrl;
