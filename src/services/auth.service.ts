import api from './api';
import { User } from '../types';

interface LoginResponse {
  token: string;
  user: User;
  token_type: string;
  expires_at: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await api.post<{ message: string; user: User }>('/register', userData);
      return response.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout(): void {
    // Call the logout endpoint if the user is authenticated
    if (this.isAuthenticated()) {
      api.post('/logout')
        .catch(error => console.error('Logout error:', error));
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService(); 