module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    var query = req.query.q || '';
    var apiKey = process.env['OMDB_API_KEY'];

    if (!query || query.length < 2) {
      return res.status(200).json({ suggestions: [], message: 'Query too short' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required', suggestions: [] });
    }

    var response = await fetch(
      'https://www.omdbapi.com/?apikey=' + apiKey + '&s=' + encodeURIComponent(query)
    );
    var data = await response.json();

    if (data.Response === 'False') {
      return res.status(200).json({ suggestions: [], message: data.Error || 'No results found' });
    }

    var suggestions = data.Search.map(function(item) {
      return {
        id: item.imdbID,
        title: item.Title,
        year: item.Year,
        type: item.Type,
        poster: item.Poster !== 'N/A' ? item.Poster : null
      };
    }).slice(0, 5);

    return res.status(200).json({ suggestions: suggestions });
  } catch (error) {
    console.error('Error in suggestions API:', error);
    return res.status(500).json({ error: 'Failed to fetch suggestions', errorDetails: error.message, suggestions: [] });
  }
};
