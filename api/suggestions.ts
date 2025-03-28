export default async function handler(req: { method: string; query: { q: string; apikey: string | undefined; }; }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; end: { (): any; new(): any; }; json: { (arg0: { suggestions: any; message?: any; error?: string; errorDetails?: any; }): any; new(): any; }; }; }) {
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

  try {
    // Get query from request
    const query = req.query.q || '';
    const apiKey = req.query.apikey || process.env["OMDB_API_KEY"];

    if (!query || query.length < 2) {
      return res.status(200).json({
        suggestions: [],
        message: 'Query too short'
      });
    }

    if (!apiKey) {
      return res.status(400).json({
        error: 'API key is required',
        suggestions: []
      });
    }

    // Fetch from OMDB API
    console.log(`Fetching results for "${query}" from OMDB API`);
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}&type=movie`
    );

    const data = await response.json();
    console.log('OMDB API response:', JSON.stringify(data).substring(0, 200) + '...');

    if (data.Response === 'False') {
      // No results or API error
      return res.status(200).json({
        suggestions: [],
        message: data.Error || 'No results found'
      });
    }

    // Format suggestions
    const suggestions = data.Search.map((item: { imdbID: any; Title: any; Year: any; Type: any; Poster: string; }) => ({
      id: item.imdbID,
      title: item.Title,
      year: item.Year,
      type: item.Type,
      poster: item.Poster !== 'N/A' ? item.Poster : null
    })).slice(0, 5); // Limit to 5 suggestions

    // Return the suggestions
    return res.status(200).json({ suggestions });

  } catch (error: any) {
    console.error('Error in suggestions API:', error);
    return res.status(500).json({
      error: 'Failed to fetch suggestions',
      errorDetails: error.message,
      suggestions: []
    });
  }
}
