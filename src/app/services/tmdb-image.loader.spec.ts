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
