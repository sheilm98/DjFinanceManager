import { apiRequest } from './queryClient';
import { User, InsertUser } from '@shared/schema';

export async function login(email: string, password: string): Promise<User> {
  const res = await apiRequest('POST', '/api/auth/login', { email, password });
  return await res.json();
}

export async function register(userData: InsertUser): Promise<User> {
  const res = await apiRequest('POST', '/api/auth/register', userData);
  return await res.json();
}

export async function logout(): Promise<void> {
  await apiRequest('POST', '/api/auth/logout');
}

export async function getUser(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/user', { credentials: 'include' });
    if (res.status === 401) return null;
    if (!res.ok) throw new Error('Failed to fetch user');
    return await res.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
