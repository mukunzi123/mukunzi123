import { User } from '../types';

const USERS_KEY = 'cineflow_users';
const CURRENT_USER_KEY = 'cineflow_current_user';
const ADMIN_EMAIL = 'mukunzifabien@gmail.com';

export const authService = {
  getUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  register: (name: string, email: string, password: string): User | null => {
    const users = authService.getUsers();
    if (users.find(u => u.email === email)) return null;

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user',
      downloads: [],
      createdAt: Date.now()
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  login: (email: string, password: string): User | null => {
    const users = authService.getUsers();
    const user = users.find(u => u.email === email);
    if (user) {
      // Refresh admin role if email matches (in case it was changed)
      if (user.email.toLowerCase() === ADMIN_EMAIL) {
        user.role = 'admin';
      }
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
    const user = stored ? JSON.parse(stored) : null;
    if (user && user.email.toLowerCase() === ADMIN_EMAIL) {
      user.role = 'admin';
    }
    return user;
  },

  recordDownload: (movieId: string): User | null => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;

    const users = authService.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return null;

    if (!users[userIndex].downloads.includes(movieId)) {
      users[userIndex].downloads.push(movieId);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
    }
    return users[userIndex];
  }
};