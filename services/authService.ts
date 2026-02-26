import { User } from '../types';

const USERS_KEY = 'cineflow_users';
const CURRENT_USER_KEY = 'cineflow_current_user';
const ADMIN_EMAIL = 'mukunzifabien@gmail.com';

export const authService = {
  getUsers: async (): Promise<User[]> => {
    const response = await fetch('/api/admin/users');
    return response.json();
  },

  register: async (name: string, email: string, password: string): Promise<User | null> => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (response.ok) {
      const user = await response.json();
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  login: async (email: string, password: string): Promise<User | null> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (response.ok) {
      const user = await response.json();
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  recordDownload: async (movieId: string): Promise<User | null> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;

    const response = await fetch(`/api/users/${currentUser.id}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId })
    });
    
    if (response.ok) {
      const user = await response.json();
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  deleteUser: async (id: string): Promise<void> => {
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
  }
};