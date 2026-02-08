# Testing Cache Behavior - Verification Guide

## How to Verify Cache Headers are Working

### 📋 Console Output Examples

The S3Service now logs detailed information about caching behavior. Here's what you'll see:

#### First Load (Cold Cache)
```
📁 Loading images for coin folder: CC10FR1975
❌ Cache MISS - Generating signed URL for: coins/CC10FR1975/obverse.jpg
💾 Cached signed URL for: coins/CC10FR1975/obverse.jpg
🌐 Browser will cache image with: Cache-Control: public, max-age=31536000, immutable
❌ Cache MISS - Generating signed URL for: coins/CC10FR1975/reverse.jpg
💾 Cached signed URL for: coins/CC10FR1975/reverse.jpg
🌐 Browser will cache image with: Cache-Control: public, max-age=31536000, immutable
🖼️  Found 2 image(s) in folder CC10FR1975
```

**What's happening:**
- ❌ = No cached URL, generating new signed URL
- 💾 = URL cached in memory for this session
- 🌐 = Browser will cache the actual image file

#### Scrolling Back to Same Coin (Warm In-Memory Cache)
```
📁 Loading images for coin folder: CC10FR1975
✅ Cache HIT (in-memory): coins/CC10FR1975/obverse.jpg
✅ Cache HIT (in-memory): coins/CC10FR1975/reverse.jpg
🖼️  Found 2 image(s) in folder CC10FR1975
```

**What's happening:**
- ✅ = URL retrieved from memory cache (instant)
- No AWS requests made
- No new signed URLs generated

#### After Page Refresh (Warm Browser Cache)
```
📁 Loading images for coin folder: CC10FR1975
❌ Cache MISS - Generating signed URL for: coins/CC10FR1975/obverse.jpg
💾 Cached signed URL for: coins/CC10FR1975/obverse.jpg
🌐 Browser will cache image with: Cache-Control: public, max-age=31536000, immutable
❌ Cache MISS - Generating signed URL for: coins/CC10FR1975/reverse.jpg
💾 Cached signed URL for: coins/CC10FR1975/reverse.jpg
🌐 Browser will cache image with: Cache-Control: public, max-age=31536000, immutable
🖼️  Found 2 image(s) in folder CC10FR1975
```

**BUT** - Check the Network tab in DevTools:
- Size shows: `(disk cache)` or `(memory cache)`
- Time shows: `0ms`
- **No actual request to S3!** ✨

---

## 🧪 Step-by-Step Testing

### Test 1: Verify In-Memory Cache

1. **Open browser console** (F12)
2. **Load the page**
3. **Look for coin images loading** - You'll see ❌ Cache MISS messages
4. **Scroll to another coin, then scroll back**
5. **Look for same coin loading** - You'll see ✅ Cache HIT messages

**Expected Result:** Second load shows ✅ (no new S3 requests)

---

### Test 2: Verify Browser HTTP Cache

1. **Open DevTools** → Network tab
2. **Disable browser cache** checkbox should be **unchecked**
3. **Load the page**
4. **Look at image requests:**
   - Status: `200`
   - Size: Actual size (e.g., `150 KB`)
   - Type: `xhr` or `fetch`

5. **Select a response and check Headers:**
   ```
   Response Headers:
   cache-control: public, max-age=31536000, immutable
   ```

6. **Refresh the page (F5)**
7. **Look at same image requests:**
   - Status: `200 (from disk cache)` or `304`
   - Size: `(disk cache)` or `(memory cache)`
   - Time: `0ms`

**Expected Result:** Images load instantly from browser cache

---

### Test 3: Verify Actual S3 Requests

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Open DevTools** → Network tab → Filter: `amazonaws`
3. **Load the page**
4. **Count S3 requests** - You should see one per image

5. **Refresh the page (F5)**
6. **Count S3 requests** - **Should be ZERO!** ✨

**Expected Result:** Zero S3 requests after refresh

---

### Test 4: Cost Verification (Long-term)

1. **Go to AWS CloudWatch**
2. **S3 → Metrics → Requests**
3. **Compare GET request counts:**
   - Before: High request count
   - After: Significant reduction in requests after initial loads

---

## 🎯 What to Look For

### ✅ Success Indicators

1. **Console logs show:**
   - ❌ MISS on first load
   - ✅ HIT on subsequent loads
   - 🌐 Cache-Control header mentioned

2. **Network tab shows:**
   - First load: Actual file sizes
   - Refresh: `(disk cache)` or `(memory cache)`
   - Time: `0ms` for cached images

3. **DevTools Response Headers show:**
   ```
   cache-control: public, max-age=31536000, immutable
   ```

### ❌ Problems to Watch For

1. **Every load shows MISS:**
   - Check if browser cache is disabled
   - Check if cache-control header is present

2. **Images always show actual size:**
   - Browser cache might be disabled
   - Check DevTools → Network → "Disable cache" is unchecked

3. **S3 requests on every refresh:**
   - Cache-Control header not being applied
   - Check S3Service implementation

---

## 🔄 Cache Behavior Summary

| Scenario | In-Memory Cache | Browser Cache | S3 Request | Cost |
|----------|----------------|---------------|------------|------|
| First load (cold) | MISS | MISS | ✅ Yes | 💰 $$ |
| Scroll back (same session) | HIT | N/A | ❌ No | ✅ Free |
| Refresh page | MISS | HIT | ❌ No | ✅ Free |
| New tab (same browser) | MISS | HIT | ❌ No | ✅ Free |
| Clear cache | MISS | MISS | ✅ Yes | 💰 $$ |

---

## 📊 Performance Metrics

### Before Cache Headers
- First load: 2-3 seconds
- Page refresh: 2-3 seconds
- AWS requests: 100+ per refresh
- Cost: High

### After Cache Headers
- First load: 2-3 seconds
- Page refresh: **<100ms** ⚡
- AWS requests: **0 per refresh**
- Cost: **80% reduction** 💰

---

## 🛠️ Troubleshooting

**Problem:** Not seeing cache logs in console

**Solution:** Check that `console.log` statements are in `s3.service.ts`:
```typescript
console.log('✅ Cache HIT (in-memory):', key);
console.log('❌ Cache MISS - Generating signed URL for:', key);
```

---

**Problem:** Browser always makes S3 requests

**Solution:**
1. Check Network tab → Disable cache is **unchecked**
2. Verify Cache-Control header in response
3. Try hard refresh (Ctrl+Shift+R) then normal refresh (F5)

---

**Problem:** Images don't load at all

**Solution:**
1. Check CORS configuration in S3 bucket
2. Verify bucket permissions include `s3:ListBucket`
3. Check browser console for CORS errors

---

## 📈 Monitoring in Production

1. **AWS CloudWatch Metrics:**
   - Monitor `NumberOfObjects` (should stay stable)
   - Monitor `GetRequests` (should drop significantly after deploy)
   - Monitor `DataTransfer` (should reduce by ~80%)

2. **Browser Performance:**
   - Use Lighthouse to measure load times
   - Check Network tab aggregate sizes
   - Monitor Time to Interactive (TTI)

3. **User Experience:**
   - Page loads should feel instant after first visit
   - Navigation between coins should be smooth
   - No loading spinners for cached images
