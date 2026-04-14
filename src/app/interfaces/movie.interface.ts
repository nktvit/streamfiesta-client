export interface IMovie {
  Poster: string
  imdbID: string
  Plot: string
  Title: string
  tmdbId?: number
  mediaType?: 'movie' | 'tv'
  Backdrop?: string
  Rating?: number
  Year?: string
}
