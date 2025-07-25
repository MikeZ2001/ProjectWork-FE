export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'operator' | 'admin';
  createdAt: string;
}
