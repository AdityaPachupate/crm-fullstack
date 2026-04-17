import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '@/api/medicines.api';

export const MEDICINES_QUERY_KEY = ['medicines'];

export function useMedicines(isTrash: boolean = false) {
  return useQuery({
    queryKey: [...MEDICINES_QUERY_KEY, { isTrash }],
    queryFn: () => medicinesApi.getAll(isTrash),
  });
}
