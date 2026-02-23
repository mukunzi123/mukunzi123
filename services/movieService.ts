
import { Movie } from '../types';
import { INITIAL_MOVIES } from '../constants';

const MOVIES_KEY = 'cineflow_movies';

export const movieService = {
  getMovies: (): Movie[] => {
    const stored = localStorage.getItem(MOVIES_KEY);
    if (!stored) {
      localStorage.setItem(MOVIES_KEY, JSON.stringify(INITIAL_MOVIES));
      return INITIAL_MOVIES;
    }
    return JSON.parse(stored);
  },

  getMovieById: (id: string): Movie | undefined => {
    const movies = movieService.getMovies();
    return movies.find(m => m.id === id);
  },

  addMovie: (movie: Omit<Movie, 'id'>): Movie => {
    const movies = movieService.getMovies();
    const newMovie = { ...movie, id: Date.now().toString() };
    const updated = [newMovie, ...movies];
    localStorage.setItem(MOVIES_KEY, JSON.stringify(updated));
    return newMovie;
  },

  deleteMovie: (id: string): void => {
    const movies = movieService.getMovies();
    const updated = movies.filter(m => m.id !== id);
    localStorage.setItem(MOVIES_KEY, JSON.stringify(updated));
  },

  bulkDeleteMovies: (ids: string[]): void => {
    const movies = movieService.getMovies();
    const updated = movies.filter(m => !ids.includes(m.id));
    localStorage.setItem(MOVIES_KEY, JSON.stringify(updated));
  },

  bulkUpdateStatus: (ids: string[], status: 'Online' | 'Offline'): void => {
    const movies = movieService.getMovies();
    const updated = movies.map(m => ids.includes(m.id) ? { ...m, status } : m);
    localStorage.setItem(MOVIES_KEY, JSON.stringify(updated));
  },

  updateMovie: (id: string, updates: Partial<Movie>): Movie | null => {
    const movies = movieService.getMovies();
    const index = movies.findIndex(m => m.id === id);
    if (index === -1) return null;
    
    const updatedMovie = { ...movies[index], ...updates };
    movies[index] = updatedMovie;
    localStorage.setItem(MOVIES_KEY, JSON.stringify(movies));
    return updatedMovie;
  }
};
