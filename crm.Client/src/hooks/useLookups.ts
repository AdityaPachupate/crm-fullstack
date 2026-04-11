import { useQuery } from '@tanstack/react-query';
import { LookupValue } from '@/types';
import { apiClient } from '@/lib/api-client';

export const LOOKUPS_QUERY_KEY = ['lookups'];

export const lookupsApi = {
  getAll: async (): Promise<LookupValue[]> => {
    const data = await apiClient<any>('/api/lookups?pageSize=200');
    return data.items || [];
  }
};

export function useLookups() {
  return useQuery({
    queryKey: LOOKUPS_QUERY_KEY,
    queryFn: lookupsApi.getAll,
    staleTime: 60 * 60 * 1000, // 1 hour (lookups rarely change)
  });
}
