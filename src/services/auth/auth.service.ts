import api from '../api';
import { User } from '@models/user';
import {LoginRequestDto} from "@dto/login/login-request-dto";
import {RegisterRequestDto} from "@dto/register/register-request-dto";
import {LoginResponseDto} from "@dto/login/login-response-dto";

class AuthService {
  async login(credentials: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      const response = await api.post<LoginResponseDto>('/v1/login', credentials);
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
      api.post('/v1/logout').catch(error => console.error('Logout error:', error));
  }

}

export default new AuthService(); 