import { useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/api/leads.api';
import { followupsApi } from '@/api/followups.api';
import { LEADS_QUERY_KEY } from './useLeads';
import { FOLLOWUPS_QUERY_KEY } from './useFollowUps';

export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchLead = (id: string) => {
    if (!id) return;
    queryClient.prefetchQuery({
      queryKey: [...LEADS_QUERY_KEY, id],
      queryFn: () => leadsApi.getById(id),
      staleTime: 60 * 1000, // 1 minute
    });
  };

  const prefetchTodayFollowups = () => {
    queryClient.prefetchQuery({
      queryKey: [...FOLLOWUPS_QUERY_KEY, 'today'],
      queryFn: () => followupsApi.getAllToday(),
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  const prefetchLeadsList = () => {
    queryClient.prefetchQuery({
      queryKey: LEADS_QUERY_KEY,
      queryFn: () => leadsApi.getAll(),
      staleTime: 60 * 1000,
    });
  };

  return {
    prefetchLead,
    prefetchTodayFollowups,
    prefetchLeadsList,
  };
}
