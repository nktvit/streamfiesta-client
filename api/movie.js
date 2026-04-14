module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.setHeader('Cache-Control', 's-maxage=604800, stale-while-revalidate=86400');

  var id = req.query.id;
  if (!id || !/^tt\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid IMDB ID. Expected format: tt1234567' });
  }

  var omdbKey = process.env['OMDB_API_KEY'];
  var tmdbKey = process.env['TMDB_API_KEY'];

  if (!omdbKey) {
    return res.status(500).json({ error: 'OMDB API key not configured' });
  }

  try {
    // Fetch OMDB details and TMDB find in parallel
    var omdbUrl = 'https://www.omdbapi.com/?apikey=' + omdbKey + '&i=' + encodeURIComponent(id) + '&plot=full';
    var requests = [fetch(omdbUrl)];

    if (tmdbKey) {
      var tmdbUrl = 'https://api.themoviedb.org/3/find/' + id + '?api_key=' + tmdbKey + '&external_source=imdb_id';
      requests.push(fetch(tmdbUrl));
    }

    var responses = await Promise.all(requests);
    var omdbData = await responses[0].json();

    if (omdbData.Response === 'False') {
      return res.status(404).json({ error: omdbData.Error || 'Movie not found', Response: 'False' });
    }

    // Parse TMDB result
    var tmdbId = null;
    var tmdbMatch = null;
    if (responses[1]) {
      var tmdbData = await responses[1].json();
      tmdbMatch = (tmdbData.movie_results || [])[0] || (tmdbData.tv_results || [])[0];
      if (tmdbMatch) {
        tmdbId = tmdbMatch.id;
      }
    }

    // Fill N/A fields from TMDB
    if (tmdbMatch) {
      var na = function(v) { return !v || v === 'N/A'; };

      if (na(omdbData.Poster) && tmdbMatch.poster_path) {
        omdbData.Poster = 'https://image.tmdb.org/t/p/w342' + tmdbMatch.poster_path;
      }

      if (na(omdbData.Plot) && tmdbMatch.overview) {
        omdbData.Plot = tmdbMatch.overview;
      }

      if (na(omdbData.imdbRating) && (!omdbData.Ratings || omdbData.Ratings.length === 0) && tmdbMatch.vote_average) {
        omdbData.imdbRating = tmdbMatch.vote_average.toFixed(1);
        omdbData.Ratings = [{ Source: 'TMDB', Value: tmdbMatch.vote_average.toFixed(1) + '/10' }];
      }

      if (na(omdbData.Year)) {
        var date = tmdbMatch.release_date || tmdbMatch.first_air_date;
        if (date) omdbData.Year = date.substring(0, 4);
      }
    }

    omdbData._tmdbId = tmdbId;

    return res.status(200).json(omdbData);
  } catch (error) {
    console.error('Movie API error:', error);
    return res.status(500).json({ error: 'Failed to fetch movie details', details: error.message });
  }
};
