import api from './api';
import { User } from '../types';

interface LoginResponse {
  access_token: string;
  refresh_token: string
  //user: User;
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
      const response = await api.post<LoginResponse>('/v1/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await api.post<{ message: string; user: User }>('/v1/register', userData);
      return response.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout(): void {
      api.post('/v1/logout').catch(error => console.error('Logout error:', error));
  }

}

export default new AuthService(); 