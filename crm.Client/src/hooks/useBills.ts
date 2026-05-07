import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsApi } from '@/api/bills.api';
import { toast } from 'sonner';

import { BillDetailDto } from '@/api/bills.api';
import { BillsResponse } from '@/types';

export const BILLS_QUERY_KEY = ['bills'];

export function useBills(): import('@tanstack/react-query').UseQueryResult<BillsResponse, Error>;
export function useBills(leadId: string): import('@tanstack/react-query').UseQueryResult<BillDetailDto[], Error>;
export function useBills(leadId?: string) {
  return useQuery({
    queryKey: leadId ? [...BILLS_QUERY_KEY, leadId] : BILLS_QUERY_KEY,
    queryFn: () => leadId ? billsApi.getLeadBills(leadId) : billsApi.getAllBills(),
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ billId, amount }: { billId: string; amount: number }) => 
      billsApi.addPayment(billId, amount),
    onSuccess: (_, { amount }) => {
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      // Also invalidate lead details to update the total balance in overview
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(`Payment of ₹${amount.toLocaleString()} recorded successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment');
    }
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (billId: string) => billsApi.deleteBill(billId, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Bill moved to trash successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete bill');
    }
  });
}
