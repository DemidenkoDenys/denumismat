# S3 Cache Strategy - Preventing Repeated Image Loading

## Overview
The application uses a two-level caching strategy to minimize AWS S3 costs and improve performance by preventing repeated image downloads.

## Cache Levels

### Level 1: In-Memory Cache (Application Level)
**Location:** `S3Service.imageCache` (Map<string, string>)

```typescript
private imageCache = new Map<string, string>();

// Check cache before making S3 request
if (this.imageCache.has(key)) {
  return of(this.imageCache.get(key)!);
}
```

**Benefits:**
- ✅ Instant response for previously loaded images
- ✅ No network request to AWS
- ✅ No AWS S3 charges
- ⚠️ Lost on page refresh

### Level 2: Browser HTTP Cache (Page Reload)
**Location:** Browser's HTTP cache

```typescript
const command = new GetObjectCommand({
  Bucket: this.bucketName,
  Key: key,
  ResponseCacheControl: 'public, max-age=31536000, immutable'
});
```

**Cache-Control Header Settings:**
- `public` - Allows caching by browser and CDN
- `max-age=31536000` - Cache for 1 year (31,536,000 seconds)
- `immutable` - Resource never changes, browser can skip revalidation

**Benefits:**
- ✅ Images persist after page refresh
- ✅ No network request to AWS on reload
- ✅ No AWS S3 charges for cached images
- ✅ Works across browser tabs
- ✅ Persists until cache expiration or manual clear

## How It Works

### First Load (Cold Cache)
```
User opens page
  ↓
Coin card needs image
  ↓
S3Service.getSignedUrl(key)
  ↓
Check imageCache → NOT FOUND
  ↓
Generate signed URL with Cache-Control header
  ↓
Browser requests image from S3
  ↓
S3 responds with image + Cache-Control header
  ↓
Browser stores in HTTP cache
  ↓
S3Service stores URL in imageCache
  ↓
Image displayed
```

**AWS Charges:** ✓ (GET request counted)

### Second Load (Same Session)
```
User scrolls to another coin, then back
  ↓
Coin card needs same image
  ↓
S3Service.getSignedUrl(key)
  ↓
Check imageCache → FOUND
  ↓
Return cached URL immediately
  ↓
Browser uses cached image (HTTP cache)
  ↓
Image displayed instantly
```

**AWS Charges:** ✗ (No request to S3)

### After Page Refresh (Warm Browser Cache)
```
User refreshes page
  ↓
imageCache cleared (in-memory lost)
  ↓
Coin card needs image
  ↓
S3Service.getSignedUrl(key)
  ↓
Check imageCache → NOT FOUND
  ↓
Generate signed URL with Cache-Control header
  ↓
Browser requests image
  ↓
Browser checks HTTP cache → FOUND
  ↓
Browser uses cached image (no S3 request)
  ↓
Image displayed instantly
```

**AWS Charges:** ✗ (Browser serves from cache, no S3 request)

## Verification in Browser DevTools

### Check if Caching Works:

1. **Open DevTools** → Network tab
2. **Filter:** Images
3. **Load page first time:**
   - Status: `200` (from S3)
   - Size: actual size (e.g., `150 KB`)
   - Time: network time (e.g., `250ms`)

4. **Refresh page:**
   - Status: `200` (from disk cache) or `304`
   - Size: `(disk cache)` or `(memory cache)`
   - Time: `0ms` or very small

5. **Look for Cache-Control header in Response Headers:**
   ```
   cache-control: public, max-age=31536000, immutable
   ```

## Impact

### Before Cache Headers
- Each page reload → Full download from S3
- 100 images × 200 KB = 20 MB download
- AWS charges for every GET request
- Slow page load times

### After Cache Headers
- First load → Download from S3 (20 MB)
- **Subsequent reloads → 0 bytes from S3** ✨
- **AWS charges only once per image per user**
- Instant page loads after first visit

## Cost Savings Example

**Scenario:** 1000 users, each views 100 coin images, stays for 5 page reloads

### Without Caching:
- Total requests: 1000 × 100 × 5 = 500,000 S3 GET requests
- AWS S3 cost: $0.0004 per 1000 requests = **$0.20**
- Data transfer: 1000 × 100 × 200 KB × 5 = 100 GB
- Data transfer cost: 100 GB × $0.09/GB = **$9.00**
- **Total: $9.20**

### With Caching:
- Total requests: 1000 × 100 × 1 = 100,000 S3 GET requests (only first load)
- AWS S3 cost: $0.0004 per 1000 requests = **$0.04**
- Data transfer: 1000 × 100 × 200 KB × 1 = 20 GB
- Data transfer cost: 20 GB × $0.09/GB = **$1.80**
- **Total: $1.84**

**Savings: $7.36 (80% reduction)** 🎉

## Implementation Details

All three methods that generate signed URLs now include cache control:

1. **getCoinImageUrlSigned()** - Individual coin images
2. **getSignedUrl()** - Generic image loader
3. **loadImageBlob()** - Blob-based loading

The `getCoinFolderImages()` method uses `getSignedUrl()` internally, so all folder-based images are also cached.

## Browser Cache Management

Users can clear cache to force reload:
- **Chrome:** DevTools → Network → Disable cache (while DevTools open)
- **Clear all:** Settings → Privacy → Clear browsing data → Cached images
- **Hard refresh:** `Ctrl+Shift+R` or `Cmd+Shift+R`

## Best Practices

✅ **DO:**
- Keep images immutable (don't change content at same URL)
- Use versioned URLs if content changes
- Monitor AWS CloudFront for additional CDN caching

⚠️ **DON'T:**
- Change image content without changing the URL
- Set `immutable` for frequently updated assets
- Assume cache works without testing in Network tab
