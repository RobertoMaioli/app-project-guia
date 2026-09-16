import * as SecureStore from 'expo-secure-store';
import { apiFetch } from './client';

const TOKEN_KEY = 'auth_token';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export function login(email: string, senha: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

export function cadastro(nome: string, email: string, senha: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/cadastro', {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha }),
  });
}

export function loginGoogle(idToken: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export function saveToken(token: string) {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function clearToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}
