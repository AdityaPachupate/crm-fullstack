import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsApi } from '@/api/bills.api';
import { toast } from 'sonner';

export const BILLS_QUERY_KEY = ['bills'];

export function useBills(leadId: string) {
  return useQuery({
    queryKey: [...BILLS_QUERY_KEY, leadId],
    queryFn: () => billsApi.getLeadBills(leadId),
    enabled: !!leadId,
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ billId, amount }: { billId: string; amount: number }) => 
      billsApi.addPayment(billId, amount),
    onSuccess: (_, { billId }) => {
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      // Also invalidate lead details to update the total balance in overview
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment');
    }
  });
}
