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

  const apiKey = process.env['TMDB_API_KEY'];
  if (!apiKey) {
    return res.status(500).json({ error: 'TMDB API key not configured' });
  }

  const TMDB_BASE = 'https://api.themoviedb.org/3';

  const LIST_ENDPOINTS = {
    trending: '/trending/movie/week',
    now_playing: '/movie/now_playing',
    popular: '/movie/popular',
    top_rated: '/movie/top_rated',
    trending_tv: '/trending/tv/week',
  };

  function mapMovie(item) {
    return {
      imdbID: '',
      tmdbId: item.id,
      Title: item.title || item.name || '',
      Poster: item.poster_path
        ? 'https://image.tmdb.org/t/p/w500' + item.poster_path
        : '',
      Plot: item.overview || '',
      Backdrop: item.backdrop_path
        ? 'https://image.tmdb.org/t/p/original' + item.backdrop_path
        : '',
      Rating: item.vote_average || 0,
      Year: (item.release_date || item.first_air_date || '').substring(0, 4),
    };
  }

  var list = req.query.list;
  var id = req.query.id;

  try {
    if (list === 'movie' && id) {
      var response = await fetch(TMDB_BASE + '/movie/' + id + '?api_key=' + apiKey);
      var data = await response.json();
      return res.status(200).json({ imdbID: data.imdb_id || '' });
    }

    if (list === 'recommendations' && id) {
      var response = await fetch(TMDB_BASE + '/movie/' + id + '/recommendations?api_key=' + apiKey + '&language=en-US&page=1');
      var data = await response.json();
      if (!data.results) {
        return res.status(200).json({ movies: [] });
      }
      var movies = data.results
        .filter(function(item) { return item.vote_count > 50; })
        .map(mapMovie);
      return res.status(200).json({ movies: movies });
    }

    var endpoint = list ? LIST_ENDPOINTS[list] : null;
    if (!endpoint) {
      return res.status(400).json({ error: 'Invalid list parameter' });
    }

    var response = await fetch(TMDB_BASE + endpoint + '?api_key=' + apiKey + '&language=en-US&page=1');
    var data = await response.json();

    if (!data.results) {
      return res.status(200).json({ movies: [] });
    }

    var movies = data.results
      .filter(function(item) { return item.original_language !== 'ru' && item.vote_count > 100; })
      .map(mapMovie);
    return res.status(200).json({ movies: movies });
  } catch (error) {
    console.error('TMDB API error:', error);
    return res.status(500).json({ error: 'Failed to fetch from TMDB', details: error.message });
  }
};
