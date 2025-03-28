// api/suggestions.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

// Configure cache time (in seconds)
const CACHE_TTL = 60 * 60 * 24; // 1 day
const CACHE_PREFIX = 'omdb_suggest_';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get query from request
  const query = req.query['q'];
  if (!query || typeof query !== 'string' || query.length < 2) {
    return res.status(400).json({
      error: 'Missing or invalid query parameter',
      suggestions: []
    });
  }

  try {
    // Check cache first
    const cacheKey = `${CACHE_PREFIX}${query.toLowerCase()}`;
    const cachedResults = await kv.get(cacheKey);

    if (cachedResults) {
      console.log(`Cache hit for "${query}"`);
      return res.status(200).json({
        suggestions: cachedResults,
        cached: true
      });
    }

    // Cache miss, fetch from OMDB API
    console.log(`Cache miss for "${query}", fetching from OMDB API`);
    const apiKey = process.env['OMDB_API_KEY'];

    if (!apiKey) {
      throw new Error('OMDB API key not configured');
    }

    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}&type=movie`
    );

    const data = await response.json();

    if (data.Response === 'False') {
      // No results or API error
      return res.status(200).json({
        suggestions: [],
        message: data.Error || 'No results found'
      });
    }

    // Format suggestions
    const suggestions = data.Search.map((item: any) => ({
      id: item.imdbID,
      title: item.Title,
      year: item.Year,
      type: item.Type,
      poster: item.Poster !== 'N/A' ? item.Poster : null
    })).slice(0, 5); // Limit to 5 suggestions

    // Store in cache
    await kv.set(cacheKey, suggestions, { ex: CACHE_TTL });

    // Return the suggestions
    return res.status(200).json({ suggestions });

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return res.status(500).json({
      error: 'Failed to fetch suggestions',
      suggestions: []
    });
  }
}
