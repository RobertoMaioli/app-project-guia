import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';

export interface Categoria {
  id: number;
  slug: string;
  label: string;
  icon: string;
}

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: () => apiFetch<Categoria[]>('/categorias'),
  });
}
