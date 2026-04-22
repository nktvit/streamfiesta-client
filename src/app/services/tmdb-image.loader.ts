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
  const tier = tmdbTier(width || 342);
  return `https://${TMDB_HOST}/t/p/${tier}/${filename}`;
}
