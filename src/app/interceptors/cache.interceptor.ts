import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

const cache = new Map<string, { response: HttpResponse<unknown>; timestamp: number }>();

function getCacheDuration(url: string): number {
  if (url.includes('omdbapi.com')) return Infinity;
  if (url.includes('/api/tmdb') || url.includes('api.themoviedb.org')) return 600000;
  if (url.includes('/api/suggestions')) return 300000;
  return 0; // don't cache
}

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);

  const duration = getCacheDuration(req.url);
  if (duration === 0) return next(req);

  const cached = cache.get(req.urlWithParams);
  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (duration === Infinity || age < duration) {
      return of(cached.response.clone());
    }
    cache.delete(req.urlWithParams);
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(req.urlWithParams, { response: event.clone(), timestamp: Date.now() });
      }
    })
  );
};
