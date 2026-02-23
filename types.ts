
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  downloads: string[]; // IDs of movies downloaded
  createdAt: number;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  trailerUrl: string;
  category: string;
  year: number;
  fileSize: string;
  popularity: number;
  quality: '4K' | 'Full HD' | 'HD';
  status?: 'Online' | 'Offline';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
