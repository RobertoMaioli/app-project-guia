import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';

export interface Stats {
  totalLugares: number;
  totalCategorias: number;
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => apiFetch<Stats>('/stats'),
  });
}
