
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  downloads: string[]; // IDs of movies downloaded
  createdAt: number;
}

export interface Comment {
  id: number;
  video_id: string;
  username: string;
  email?: string;
  comment_text: string;
  created_at: number;
  status: 'Pending' | 'Approved' | 'Hidden';
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  trailerUrl: string;
  videoUrl: string;
  category: string;
  year: number;
  releaseDate: string;
  director?: string;
  country?: string;
  fileSize: string;
  popularity: number;
  quality: '4K' | 'Full HD' | 'HD';
  status?: 'Online' | 'Offline';
  views?: number;
  comments?: Comment[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
