# Image Optimization Design

**Date:** 2026-04-22
**Topic:** Speed up page loading via improved image delivery
**Status:** Approved

## Problem

Lighthouse audit identified ~1,058 KiB of savings on TMDB poster images. Two root causes:

1. **Wrong `sizes` attribute** — every `<app-poster>` uses a single static value (`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`) regardless of actual rendered width. Carousel posters render at 120–190px fixed widths, not `33vw` (~420px on a 1280px screen). The browser requests a far larger image variant than needed.

2. **No modern image format** — TMDB serves `.jpg` by default but supports `.webp` natively (change the file extension in the URL). WebP is typically 25–35% smaller at equivalent quality.

## Approach

Custom Angular image loader + per-context `sizes` attribute. No infrastructure changes.

## Architecture

### 1. Custom TMDB Image Loader (`src/app/services/tmdb-image.loader.ts`)

A function registered via Angular's `IMAGE_LOADER` token. Responsibilities:

- **Width-to-tier mapping** — maps any requested pixel width to TMDB's nearest available size tier (rounding up to avoid quality loss):
  - `≤ 92` → `w92`
  - `≤ 154` → `w154`
  - `≤ 185` → `w185`
  - `≤ 342` → `w342`
  - `≤ 500` → `w500`
  - `≤ 780` → `w780`
  - `> 780` → `w1280`
- **WebP conversion** — replaces `.jpg` with `.webp` in the filename.
- **TMDB URL reconstruction** — extracts the image path from a full TMDB URL and rebuilds it with the correct tier. Input URLs follow the pattern `https://image.tmdb.org/t/p/wXXX/filename.jpg`.
- **Pass-through for non-TMDB URLs** — OMDB/Amazon fallback URLs are returned unchanged. The loader detects non-TMDB hosts by checking whether the `src` contains `image.tmdb.org`.

### 2. `app.config.ts` Updates

Two changes:

- **Register `IMAGE_LOADER`** — provide the custom loader function.
- **Fix `IMAGE_CONFIG`** — replace the current warning-suppression config (`disableImageSizeWarning: true`) with `breakpoints: [92, 154, 185, 342, 500, 780, 1280]`. These breakpoints match TMDB's exact size tiers, so NgOptimizedImage generates a srcset with only valid TMDB widths (no intermediary values that would be rounded up to the same tier anyway). Remove `disableImageSizeWarning` — sizes will be correct.

### 3. `sizes` Input on `PosterComponent`

Add a `sizes` input with a default value. Three distinct values are used across the app:

| Context | `sizes` value |
|---|---|
| **Carousel** (main/tv horizontal rows) | `(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 170px, 190px` |
| **Grid** (movies-grid, genre page) | `(max-width: 640px) 44vw, (max-width: 768px) 30vw, (max-width: 1024px) 23vw, 18vw` |
| **Sidebar** (movie detail page) | `(max-width: 768px) 45vw, 280px` |

The grid value is the default (most common usage). Call sites that use carousel or sidebar layout pass their value explicitly via `[sizes]="..."`.

### 4. Hero Backdrop

The hero `<img>` in `main.component.html` uses a plain `<img>` tag with `loading="eager"`. Replace it with NgOptimizedImage (`[ngSrc]`, `[priority]="true"`, `sizes="100vw"`, `fill`). This adds `fetchpriority="high"` automatically and routes the request through the loader (WebP, w1280 tier).

## Data Flow

```
Carousel poster, 2x Retina, lg breakpoint (190px slot)
  → sizes="..., 190px"
  → browser needs ~380px → picks 342w from srcset
  → loader({ src: TMDB_URL, width: 342 })
  → extracts path, maps to w342, swaps .jpg → .webp
  → fetches https://image.tmdb.org/t/p/w342/filename.webp

Carousel poster, 1x display, lg breakpoint (190px slot)
  → browser needs ~190px → picks 185w from srcset
  → fetches https://image.tmdb.org/t/p/w185/filename.webp  (saves ~45%)

OMDB fallback URL
  → loader detects non-TMDB host
  → returns src unchanged
```

## Files Changed

| File | Change |
|---|---|
| `src/app/services/tmdb-image.loader.ts` | **New** — loader function + tier mapping |
| `src/app/app.config.ts` | Register loader, fix IMAGE_CONFIG breakpoints |
| `src/app/components/poster/poster.component.ts` | Add `sizes` input (default: grid) |
| `src/app/components/poster/poster.component.html` | Wire `[sizes]` to the `<img>` |
| `src/app/pages/main/main.component.html` | Pass carousel sizes to each row; fix hero to NgOptimizedImage |
| `src/app/components/movies-grid/movies-grid.component.html` | Pass grid sizes (or rely on default) |

## Expected Outcome

- ~1,058 KiB savings flagged by Lighthouse addressed
- 1x displays download the correct tier (e.g., w185 instead of w342 for carousel)
- 2x Retina displays download the correct tier (e.g., w342 instead of w500)
- WebP reduces per-image size by ~25–35% on top
- Hero backdrop gains `fetchpriority="high"` for LCP improvement
- No infrastructure changes; zero additional latency
