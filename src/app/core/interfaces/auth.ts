import { User } from './user';

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface AuthResponse {
  readonly user: User;
  readonly message?: string;
}

export interface AuthState {
  readonly user: User | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}