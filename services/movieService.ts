
import { Movie } from '../types';
import { INITIAL_MOVIES } from '../constants';

const MOVIES_KEY = 'cineflow_movies';

export const movieService = {
  getMovies: async (): Promise<Movie[]> => {
    const response = await fetch('/api/movies');
    return response.json();
  },

  getMovieById: async (id: string): Promise<Movie | undefined> => {
    const response = await fetch(`/api/movies/${id}`);
    if (response.ok) return response.json();
    return undefined;
  },

  addMovie: async (movie: Omit<Movie, 'id'>): Promise<Movie> => {
    const response = await fetch('/api/admin/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie)
    });
    return response.json();
  },

  deleteMovie: async (id: string): Promise<void> => {
    await fetch(`/api/admin/movies/${id}`, { method: 'DELETE' });
  },

  bulkDeleteMovies: async (ids: string[]): Promise<void> => {
    // For simplicity, we'll just loop or add a bulk endpoint if needed.
    // Let's just loop for now to avoid server complexity.
    await Promise.all(ids.map(id => movieService.deleteMovie(id)));
  },

  bulkUpdateStatus: async (ids: string[], status: 'Online' | 'Offline'): Promise<void> => {
    await fetch('/api/admin/movies/bulk-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status })
    });
  },

  updateMovie: async (id: string, updates: Partial<Movie>): Promise<Movie | null> => {
    const response = await fetch(`/api/admin/movies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (response.ok) return response.json();
    return null;
  },

  // API methods for comments and views
  addComment: async (videoId: string, username: string, email: string, text: string): Promise<any> => {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: videoId, username, email, comment_text: text })
    });
    return response.json();
  },

  incrementViews: async (videoId: string): Promise<any> => {
    const response = await fetch(`/api/videos/${videoId}/view`, {
      method: 'POST'
    });
    return response.json();
  },

  getComments: async (videoId: string): Promise<Comment[]> => {
    const response = await fetch(`/api/videos/${videoId}/comments`);
    return response.json();
  },

  getViews: async (videoId: string): Promise<number> => {
    const response = await fetch(`/api/videos/${videoId}/views`);
    const data = await response.json();
    return data.views;
  },

  // Admin API methods
  getAllComments: async (): Promise<Comment[]> => {
    const response = await fetch('/api/admin/comments');
    return response.json();
  },

  updateCommentStatus: async (commentId: number, status: 'Approved' | 'Hidden'): Promise<any> => {
    const response = await fetch(`/api/admin/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  },

  deleteComment: async (commentId: number): Promise<any> => {
    const response = await fetch(`/api/admin/comments/${commentId}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  getAdminStats: async (): Promise<any> => {
    const response = await fetch('/api/admin/stats');
    return response.json();
  }
};
