import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { billsApi, BillDetailDto } from '@/api/bills.api';
import { toast } from 'sonner';
import { BillsResponse } from '@/types';

export const BILLS_QUERY_KEY = ['bills'];

export function useBills(leadId?: string, isTrash: boolean = false): UseQueryResult<any, Error> {
  return useQuery<any, Error>({
    queryKey: leadId 
      ? [...BILLS_QUERY_KEY, leadId, { isTrash }] 
      : [...BILLS_QUERY_KEY, { isTrash }],
    queryFn: () => leadId 
      ? billsApi.getLeadBills(leadId) 
      : billsApi.getAllBills(isTrash),
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
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
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
    mutationFn: ({ billId, isPermanent }: { billId: string; isPermanent: boolean }) => 
      billsApi.deleteBill(billId, isPermanent),
    onSuccess: (_, { isPermanent }) => {
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(isPermanent ? 'Bill permanently deleted' : 'Bill moved to trash successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete bill');
    }
  });
}

export function useRestoreBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Bill restored successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to restore bill');
    }
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: any) => billsApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Bill created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create bill');
    }
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ billId, paymentId }: { billId: string; paymentId: string }) => 
      billsApi.deletePayment(billId, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete payment');
    }
  });
}
