# Image Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce TMDB poster image payload by ~1,058 KiB via a custom Angular image loader (WebP + DPR-aware size tier selection) and correct `sizes` attributes on every `<app-poster>` call site.

**Architecture:** A pure `tmdbImageLoader` function registered via `IMAGE_LOADER` intercepts every `NgOptimizedImage` request, maps the requested pixel width to TMDB's nearest size tier, and swaps `.jpg` for `.webp`. Non-TMDB URLs (OMDB fallbacks) pass through unchanged. A `sizes` input on `PosterComponent` lets each call site declare its actual rendered width so the browser picks the right srcset entry.

**Tech Stack:** Angular 20, NgOptimizedImage, Karma/Jasmine, Tailwind CSS

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/app/services/tmdb-image.loader.ts` | **Create** | Pure loader function + tier mapping |
| `src/app/services/tmdb-image.loader.spec.ts` | **Create** | Jasmine unit tests for the loader |
| `src/app/app.config.ts` | **Modify** | Register loader, fix IMAGE_CONFIG breakpoints |
| `src/app/components/poster/poster.component.ts` | **Modify** | Add `sizes` input with grid default |
| `src/app/components/poster/poster.component.html` | **Modify** | Bind `[sizes]` on the `<img>` |
| `src/app/pages/main/main.component.ts` | **Modify** | Import NgOptimizedImage |
| `src/app/pages/main/main.component.html` | **Modify** | Carousel sizes on 4 rows; hero to NgOptimizedImage |
| `src/app/pages/tv/tv.component.html` | **Modify** | Carousel sizes on trending row |
| `src/app/pages/movie-page/movie-page.component.html` | **Modify** | Sidebar sizes on poster |

`movies-grid.component.html`, `genre.component.html` — no changes needed; both use the grid default.

---

### Task 1: Create the TMDB image loader

**Files:**
- Create: `src/app/services/tmdb-image.loader.ts`
- Create: `src/app/services/tmdb-image.loader.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/services/tmdb-image.loader.spec.ts`:

```typescript
import { tmdbImageLoader } from './tmdb-image.loader';

describe('tmdbImageLoader', () => {
  describe('TMDB URLs', () => {
    it('converts .jpg to .webp', () => {
      const result = tmdbImageLoader({
        src: 'https://image.tmdb.org/t/p/w342/abc123.jpg',
        width: 342,
      });
      expect(result).toContain('.webp');
      expect(result).not.toContain('.jpg');
    });

    it('maps width 100 to w154 tier', () => {
      const result = tmdbImageLoader({
        src: 'https://image.tmdb.org/t/p/w342/abc123.jpg',
        width: 100,
      });
      expect(result).toContain('/w154/');
    });

    it('maps width 185 to w185 tier', () => {
      const result = tmdbImageLoader({
        src: 'https://image.tmdb.org/t/p/w342/abc123.jpg',
        width: 185,
      });
      expect(result).toContain('/w185/');
    });

    it('maps width 342 to w342 tier', () => {
      const result = tmdbImageLoader({
        src: 'https://image.tmdb.org/t/p/w342/abc123.jpg',
        width: 342,
      });
      expect(result).toContain('/w342/');
    });

    it('maps width 400 to w500 tier', () => {
      const result = tmdbImageLoader({
        src: 'https://image.tmdb.org/t/p/w342/abc123.jpg',
        width: 400,
      });
      expect(result).toContain('/w500/');
    });

    it('maps width 800 to w1280 tier', () => {
      const result = tmdbImageLoader({
        src: 'https://image.tmdb.org/t/p/w342/abc123.jpg',
        width: 800,
      });
      expect(result).toContain('/w1280/');
    });

    it('preserves the filename', () => {
      const result = tmdbImageLoader({
        src: 'https://image.tmdb.org/t/p/w342/buPFnHZ3xQy6vZEHxbHgL1Pc6CR.jpg',
        width: 185,
      });
      expect(result).toContain('buPFnHZ3xQy6vZEHxbHgL1Pc6CR.webp');
    });

    it('constructs a valid TMDB URL', () => {
      const result = tmdbImageLoader({
        src: 'https://image.tmdb.org/t/p/w342/abc123.jpg',
        width: 185,
      });
      expect(result).toBe('https://image.tmdb.org/t/p/w185/abc123.webp');
    });
  });

  describe('non-TMDB URLs', () => {
    it('passes Amazon OMDB URLs through unchanged', () => {
      const amazonUrl = 'https://m.media-amazon.com/images/M/MV5BMjE.jpg';
      const result = tmdbImageLoader({ src: amazonUrl, width: 200 });
      expect(result).toBe(amazonUrl);
    });

    it('passes arbitrary URLs through unchanged', () => {
      const url = 'https://example.com/poster.jpg';
      const result = tmdbImageLoader({ src: url, width: 300 });
      expect(result).toBe(url);
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/nick-mbp/Developer/Projects/streamfiesta-client2
npx ng test --include=src/app/services/tmdb-image.loader.spec.ts --watch=false --browsers=ChromeHeadless
```

Expected: errors like `Cannot find module './tmdb-image.loader'`

- [ ] **Step 3: Implement the loader**

Create `src/app/services/tmdb-image.loader.ts`:

```typescript
import { ImageLoaderConfig } from '@angular/common';

const TMDB_HOST = 'image.tmdb.org';

const TMDB_TIERS = [92, 154, 185, 342, 500, 780, 1280] as const;

function tmdbTier(width: number): string {
  const tier = TMDB_TIERS.find(t => t >= width) ?? 1280;
  return `w${tier}`;
}

export function tmdbImageLoader(config: ImageLoaderConfig): string {
  const { src, width } = config;

  if (!src.includes(TMDB_HOST)) {
    return src;
  }

  const filename = src.split('/').pop()!.replace(/\.\w+$/, '.webp');
  return `https://${TMDB_HOST}/t/p/${tmdbTier(width)}/${filename}`;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx ng test --include=src/app/services/tmdb-image.loader.spec.ts --watch=false --browsers=ChromeHeadless
```

Expected: all 10 specs PASS, 0 failures

- [ ] **Step 5: Commit**

```bash
git add src/app/services/tmdb-image.loader.ts src/app/services/tmdb-image.loader.spec.ts
git commit -m "feat: add TMDB image loader with WebP and size tier mapping"
```

---

### Task 2: Register the loader in app.config.ts

**Files:**
- Modify: `src/app/app.config.ts`

- [ ] **Step 1: Update app.config.ts**

Replace the entire file content:

```typescript
import { ApplicationConfig } from '@angular/core';
import { IMAGE_CONFIG, IMAGE_LOADER } from '@angular/common';
import { provideRouter, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { cacheInterceptor } from './interceptors/cache.interceptor';
import { tmdbImageLoader } from './services/tmdb-image.loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideHttpClient(withInterceptors([cacheInterceptor])),
    provideAnimationsAsync(),
    { provide: IMAGE_LOADER, useValue: tmdbImageLoader },
    {
      provide: IMAGE_CONFIG,
      useValue: {
        breakpoints: [92, 154, 185, 342, 500, 780, 1280],
        disableImageLazyLoadWarning: true,
      },
    },
  ],
};
```

Note: `disableImageSizeWarning` is removed — sizes will now be correct. `disableImageLazyLoadWarning` is kept because `fill` mode images don't need explicit width/height.

- [ ] **Step 2: Verify the app builds**

```bash
npx ng build --configuration=development 2>&1 | tail -20
```

Expected: build completes with no errors (warnings about bundle size are fine)

- [ ] **Step 3: Commit**

```bash
git add src/app/app.config.ts
git commit -m "feat: register TMDB image loader and fix IMAGE_CONFIG breakpoints"
```

---

### Task 3: Add `sizes` input to PosterComponent

**Files:**
- Modify: `src/app/components/poster/poster.component.ts`
- Modify: `src/app/components/poster/poster.component.html`

The grid layout `sizes` value is the default because it's the most common context. Carousel and sidebar call sites override it explicitly.

- [ ] **Step 1: Add `sizes` input to the component class**

In `src/app/components/poster/poster.component.ts`, add the `sizes` input after the existing inputs. The full updated inputs block:

```typescript
readonly movie = input.required<IMovie>();
readonly size = input<'small' | 'medium' | 'large'>();
readonly displayTitle = input<boolean>(false);
readonly priority = input<boolean>(false);
readonly sizes = input<string>('(max-width: 640px) 44vw, (max-width: 768px) 30vw, (max-width: 1024px) 23vw, 18vw');
```

- [ ] **Step 2: Wire `[sizes]` in the template**

In `src/app/components/poster/poster.component.html`, replace the hardcoded `sizes` attribute on the `<img>`:

Find:
```html
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
```

Replace with:
```html
        [sizes]="sizes()"
```

- [ ] **Step 3: Build to confirm no errors**

```bash
npx ng build --configuration=development 2>&1 | tail -20
```

Expected: clean build

- [ ] **Step 4: Commit**

```bash
git add src/app/components/poster/poster.component.ts src/app/components/poster/poster.component.html
git commit -m "feat: add sizes input to PosterComponent"
```

---

### Task 4: Pass carousel sizes on main page carousel rows

**Files:**
- Modify: `src/app/pages/main/main.component.html`

There are 4 carousel rows in `main.component.html` (Trending, In Theaters, Top Rated, Trending TV). Each renders `<app-poster>` inside a `w-[120px] sm:w-[140px] md:w-[170px] lg:w-[190px]` wrapper.

- [ ] **Step 1: Add `[sizes]` to all 4 carousel poster usages**

In `main.component.html`, find each `<app-poster>` inside a carousel row and add the sizes binding. All 4 carousels use identical wrapper widths, so they all get the same value.

**Trending This Week row (line ~103):**
```html
<app-poster [movie]="movie" [displayTitle]="true"
  [sizes]="'(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 170px, 190px'"
  class="rounded overflow-hidden">
</app-poster>
```

**In Theaters Now row (line ~144):**
```html
<app-poster [movie]="movie" [displayTitle]="true"
  [sizes]="'(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 170px, 190px'"
  class="rounded overflow-hidden">
</app-poster>
```

**Top Rated of All Time row (line ~160):**
```html
<app-poster [movie]="movie" [displayTitle]="true"
  [sizes]="'(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 170px, 190px'"
  class="rounded overflow-hidden">
</app-poster>
```

**Trending TV Shows row (line ~176):**
```html
<app-poster [movie]="movie" [displayTitle]="true"
  [sizes]="'(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 170px, 190px'"
  class="rounded overflow-hidden">
</app-poster>
```

- [ ] **Step 2: Build to confirm no errors**

```bash
npx ng build --configuration=development 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/main/main.component.html
git commit -m "feat: pass carousel sizes to poster on main page"
```

---

### Task 5: Pass carousel sizes on TV page carousel row

**Files:**
- Modify: `src/app/pages/tv/tv.component.html`

The TV page has one carousel row (Trending This Week) with the same `w-[120px] sm:w-[140px] md:w-[170px] lg:w-[190px]` wrapper. Its grid section uses the default sizes (no change needed there).

- [ ] **Step 1: Add `[sizes]` to the TV carousel poster**

In `src/app/pages/tv/tv.component.html`, line 14, update the `<app-poster>`:

```html
<app-poster [movie]="movie" [displayTitle]="true"
  [sizes]="'(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 170px, 190px'"
  class="rounded overflow-hidden">
</app-poster>
```

- [ ] **Step 2: Build to confirm no errors**

```bash
npx ng build --configuration=development 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/tv/tv.component.html
git commit -m "feat: pass carousel sizes to poster on TV page"
```

---

### Task 6: Pass sidebar sizes on movie detail page

**Files:**
- Modify: `src/app/pages/movie-page/movie-page.component.html`

The movie detail page renders one `<app-poster>` in a sticky sidebar constrained to `max-w-[280px]`.

- [ ] **Step 1: Add `[sizes]` to the sidebar poster**

In `src/app/pages/movie-page/movie-page.component.html`, line 25-26, update the `<app-poster>`:

```html
<app-poster class="block overflow-hidden rounded-lg shadow-xl dark:shadow-white/10"
  [movie]="movieDetails"
  [sizes]="'(max-width: 768px) 45vw, 280px'">
</app-poster>
```

- [ ] **Step 2: Build to confirm no errors**

```bash
npx ng build --configuration=development 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/movie-page/movie-page.component.html
git commit -m "feat: pass sidebar sizes to poster on movie detail page"
```

---

### Task 7: Upgrade hero backdrop to NgOptimizedImage

**Files:**
- Modify: `src/app/pages/main/main.component.ts`
- Modify: `src/app/pages/main/main.component.html`

The hero `<img>` is the LCP element. Switching to NgOptimizedImage with `[priority]="true"` adds `fetchpriority="high"` automatically and routes the request through the loader (WebP, w1280 tier).

- [ ] **Step 1: Import NgOptimizedImage in main.component.ts**

In `src/app/pages/main/main.component.ts`, add `NgOptimizedImage` to the imports array:

```typescript
import { NgOptimizedImage } from '@angular/common';
```

Update the `imports` array in `@Component`:

```typescript
imports: [SearchBoxComponent, NavbarComponent, PosterComponent, DecimalPipe, RouterLink, NgOptimizedImage]
```

- [ ] **Step 2: Replace the hero `<img>` in main.component.html**

Find the hero backdrop block (lines 11-16):

```html
      <div class="absolute inset-0">
        <img [src]="heroMovie.Backdrop || heroMovie.Poster"
          [alt]="heroMovie.Title"
          class="w-full h-full object-cover object-top scale-105"
          loading="eager">
      </div>
```

Replace with:

```html
      <div class="absolute inset-0">
        <img [ngSrc]="heroMovie.Backdrop || heroMovie.Poster"
          [alt]="heroMovie.Title"
          fill
          [priority]="true"
          sizes="100vw"
          class="object-cover object-top scale-105">
      </div>
```

Note: `w-full h-full` are removed — `fill` mode sets `position: absolute; width: 100%; height: 100%` on the element automatically. `loading="eager"` is also removed — `[priority]="true"` handles this.

- [ ] **Step 3: Build to confirm no errors**

```bash
npx ng build --configuration=development 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/main/main.component.ts src/app/pages/main/main.component.html
git commit -m "feat: upgrade hero backdrop to NgOptimizedImage with priority"
```

---

## Self-Review

**Spec coverage:**
- ✅ Custom TMDB image loader with tier mapping → Task 1
- ✅ WebP conversion → Task 1 (loader swaps extension)
- ✅ Register loader + fix IMAGE_CONFIG breakpoints → Task 2
- ✅ `sizes` input on PosterComponent → Task 3
- ✅ Carousel sizes on main page (4 rows) → Task 4
- ✅ Carousel sizes on TV page → Task 5
- ✅ Sidebar sizes on movie detail page → Task 6
- ✅ Hero backdrop to NgOptimizedImage with priority → Task 7
- ✅ Non-TMDB pass-through → Task 1 (loader + tests)
- ✅ `movies-grid` and `genre` pages — no change needed, use grid default

**Placeholder scan:** No TBDs, no "handle edge cases", all code is complete.

**Type consistency:**
- `tmdbImageLoader` defined in Task 1, imported in Task 2 — matches exactly
- `sizes` input defined in Task 3, used in Tasks 4/5/6 — all use `sizes()` call syntax consistently
- `IMAGE_LOADER` token imported from `@angular/common` — correct module
