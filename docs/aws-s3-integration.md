# AWS S3 Integration Guide

## Overview
This application now supports loading coin images from AWS S3 buckets. Images are loaded dynamically and include fallback placeholders.

## Setup Instructions

### 1. Configure AWS Credentials

Update [src/environments/environment.ts](../src/environments/environment.ts) with your AWS credentials:

```typescript
aws: {
  region: 'us-east-1',              // Your AWS region
  accessKeyId: 'YOUR_ACCESS_KEY',    // Your AWS access key ID
  secretAccessKey: 'YOUR_SECRET',    // Your AWS secret access key
  bucketName: 'your-bucket-name'     // Your S3 bucket name
}
```

⚠️ **Security Warning**: Never commit real AWS credentials to version control. Use environment variables or AWS IAM roles in production.

### 2. S3 Bucket Structure

Organize your S3 bucket with the following structure (folder-based approach):

```
your-bucket-name/
├── coins/
│   ├── {coinId}/
│   │   ├── obverse.jpg           # Front side of coin
│   │   ├── reverse.jpg           # Back side of coin
│   │   ├── detail-1.jpg          # Optional detail images
│   │   ├── detail-2.jpg
│   │   └── ...                   # Any number of images
```

**Example:**
```
denumismat-coins/
├── coins/
│   ├── AFG-001/
│   │   ├── obverse.jpg
│   │   ├── reverse.jpg
│   │   └── static.jpg
│   ├── AFG-002/
│   │   ├── obverse.jpg
│   │   ├── reverse.jpg
│   │   ├── detail-1.jpg
│   │   └── detail-2.jpg
```

The application will automatically discover and load all image files (.jpg, .jpeg, .png, .gif, .webp) from each coin's folder.

### 3. S3 Bucket Permissions

#### Option A: Public Bucket (Simplest)
Make your bucket publicly readable:

1. Go to AWS S3 Console
2. Select your bucket
3. Go to Permissions → Block public access → Edit
4. Uncheck "Block all public access"
5. Add the following bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```

**Note:** The `s3:ListBucket` permission is required for the folder-based image loading feature.

6. **Configure CORS** (required for browser access):

Go to your bucket → **Permissions** → **Cross-origin resource sharing (CORS)** and add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag", "x-amz-request-id"],
    "MaxAgeSeconds": 3000
  }
]
```

**Important:** For public buckets, you can use `"*"` for `AllowedOrigins`. For production, restrict to your specific domain(s).

#### Option B: Private Bucket with CORS and IAM (Recommended for Production)
1. Keep bucket private
2. **Configure CORS** (Go to your bucket → Permissions → CORS):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:4200", "https://your-domain.com"],
    "ExposeHeaders": ["ETag", "x-amz-request-id"],
    "MaxAgeSeconds": 3000
  }
]
```

3. Create IAM user with permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```

4. Use the IAM user credentials in your `environment.ts`

**Note:** CORS configuration is **required** for the folder-based image loading feature to work from the browser.

### 4. Image Format Guidelines

**Recommended specifications:**
- **Thumbnails**: 400x400px, JPEG, quality 85%, ~30-50KB
- **Standard**: 800x800px, JPEG, quality 90%, ~100-200KB
- **High-res**: 1600x1600px, JPEG, quality 95%, ~300-500KB

**File naming convention:**
- Use coin ID as filename (e.g., `AFG-001.jpg`)
- Avoid spaces and special characters
- Use lowercase for consistency

## Usage

### Automatic Image Loading

The coin card component automatically loads images based on the coin ID:

```typescript
const coin: Coin = {
  id: 'AFG-001',
  country: 'AFG',
  country_name: 'Afghanistan',
  deno: '1 Afghani',
  year: 2020,
  price: 15.00
  // imageUrl is generated automatically from ID
};
```

### Custom Image URLs

You can also provide custom URLs:

```typescript
const coin: Coin = {
  id: 'AFG-001',
  // ... other fields
  imageUrl: 'https://your-bucket.s3.amazonaws.com/coins/AFG-001.jpg',
  thumbnailUrl: 'https://your-bucket.s3.amazonaws.com/coins/thumbnails/AFG-001_thumb.jpg',
  highResUrl: 'https://your-bucket.s3.amazonaws.com/coins/highres/AFG-001_highres.jpg'
};
```

### Using S3Service Directly

```typescript
import { S3Service } from './services/s3.service';

// In your component
constructor(private s3Service: S3Service) {}

// Get image URLs
const imageUrl = this.s3Service.getCoinImageUrl('AFG-001');
const thumbnailUrl = this.s3Service.getCoinThumbnailUrl('AFG-001');
const highResUrl = this.s3Service.getCoinHighResUrl('AFG-001');

// Preload images for better performance
this.s3Service.preloadImages(['AFG-001', 'AFG-002', 'AFG-003'])
  .subscribe(urls => console.log('Images preloaded'));
```

## Testing

### Test with Sample Image

1. Upload a test image to your S3 bucket:
   - Path: `coins/TEST-001.jpg`

2. Create a test coin in your Firestore:
```typescript
{
  id: 'TEST-001',
  country: 'TST',
  country_name: 'Test Country',
  deno: 'Test Coin',
  year: 2024,
  price: 10.00
}
```

3. The image should appear in the coin card automatically

### Troubleshooting

**Images not loading?**
- Check browser console for CORS errors
- Verify S3 bucket permissions
- Confirm image files exist at expected paths
- Check AWS credentials in environment.ts

**Slow loading?**
- Optimize image file sizes
- Use thumbnails for list views
- Enable CloudFront CDN for better performance
- Implement image lazy loading (already enabled)

## Production Considerations

1. **Use CloudFront**: Set up AWS CloudFront CDN for faster global image delivery
2. **Environment Variables**: Store AWS credentials in environment variables, not in code
3. **IAM Roles**: Use AWS IAM roles for EC2/Lambda instead of access keys
4. **Image Optimization**: Compress images before uploading (use tools like TinyPNG)
5. **Caching**: Implement browser caching headers on S3 objects
6. **Monitoring**: Set up AWS CloudWatch to monitor S3 access and costs

## Cost Optimization

- Use S3 Standard-IA for rarely accessed images
- Set up lifecycle policies to archive old images to Glacier
- Enable S3 Transfer Acceleration if users are global
- Monitor and set up billing alerts

## Security Best Practices

1. Never commit AWS credentials to Git
2. Use least-privilege IAM policies
3. Enable S3 bucket versioning for backup
4. Enable S3 access logging
5. Regularly rotate access keys
6. Use AWS Secrets Manager for production credentials

## Further Reading

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
