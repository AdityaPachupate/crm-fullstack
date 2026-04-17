import { useQuery } from '@tanstack/react-query';
import { packagesApi } from '@/api/packages.api';

export const PACKAGES_QUERY_KEY = ['packages'];

export function usePackages(isTrash: boolean = false) {
  return useQuery({
    queryKey: [...PACKAGES_QUERY_KEY, { isTrash }],
    queryFn: () => packagesApi.getAll(isTrash),
  });
}

export function usePackage(id: string) {
  return useQuery({
    queryKey: [...PACKAGES_QUERY_KEY, id],
    queryFn: () => packagesApi.getById(id),
    enabled: !!id,
  });
}
