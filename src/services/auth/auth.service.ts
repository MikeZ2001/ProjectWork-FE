import api from '../api';
import { User } from '@models/user';
import {LoginRequestDto} from "@dto/login/login-request-dto";
import {RegisterRequestDto} from "@dto/register/register-request-dto";
import {LoginResponseDto} from "@dto/login/login-response-dto";

class AuthService {
  async login(credentials: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      const response = await api.post<LoginResponseDto>('/v1/login', credentials);
      
      // Tokens are now stored in HTTP-only cookies by the backend
      // No need to manually store them in localStorage
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequestDto): Promise<User> {
    try {
      const response = await api.post<{ message: string; user: User }>('/v1/register', userData);
      return response.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout(): void {
      // Backend will clear HTTP-only cookies
      api.post('/v1/logout').catch(error => console.error('Logout error:', error));
  }

  isAuthenticated(): boolean {
      // We can't check HTTP-only cookies from JavaScript
      // The backend middleware will handle authentication
      // This method is kept for compatibility but always returns true
      // The actual authentication check happens on the backend
      return true;
  }

  getAccessToken(): string | null {
      // We can't access HTTP-only cookies from JavaScript
      // The backend middleware will handle token extraction
      return null;
  }

}

export default new AuthService(); 