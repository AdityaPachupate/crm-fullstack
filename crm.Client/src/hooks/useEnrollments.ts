import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi, CreateEnrollmentRequest, UpdateEnrollmentRequest } from '@/api/enrollments.api';
import { LEADS_QUERY_KEY } from './useLeads';
import { BILLS_QUERY_KEY } from './useBills';
import { toast } from 'sonner';

export const ENROLLMENTS_QUERY_KEY = ['enrollments'];

export function useEnrollment(id: string) {
  return useQuery({
    queryKey: [...ENROLLMENTS_QUERY_KEY, id],
    queryFn: () => enrollmentsApi.getById(id),
    enabled: !!id,
  });
}

export function useAllEnrollments(params?: Parameters<typeof enrollmentsApi.getAll>[0]) {
  return useQuery({
    queryKey: params ? [...ENROLLMENTS_QUERY_KEY, params] : ENROLLMENTS_QUERY_KEY,
    queryFn: () => enrollmentsApi.getAll(params),
  });
}

export function useEnrollments() {
  const queryClient = useQueryClient();

  const createEnrollment = useMutation({
    mutationFn: (request: CreateEnrollmentRequest) => enrollmentsApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Enrollment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create enrollment');
    }
  });

  const updateEnrollment = useMutation({
    mutationFn: (request: UpdateEnrollmentRequest) => enrollmentsApi.update(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      // Also invalidate the specific lead detail if possible
      if (variables.leadId) {
         queryClient.invalidateQueries({ queryKey: [...LEADS_QUERY_KEY, variables.leadId] });
      }
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Enrollment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update enrollment');
    }
  });

  const deleteEnrollment = useMutation({
    mutationFn: ({ id, isPermanent }: { id: string; isPermanent?: boolean }) => enrollmentsApi.delete(id, isPermanent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Enrollment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete enrollment');
    }
  });

  const restoreEnrollment = useMutation({
    mutationFn: (id: string) => enrollmentsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Enrollment restored successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to restore enrollment');
    }
  });

  const addPayment = useMutation({
    mutationFn: ({ billId, amount }: { billId: string; amount: number }) => 
      enrollmentsApi.addPayment(billId, amount),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate everything that might be affected by a financial change
        queryClient.invalidateQueries({ queryKey: ENROLLMENTS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        
        toast.success(result.message || 'Payment recorded successfully');
      } else {
        toast.error(result.message || 'Failed to record payment');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error recording payment');
    }
  });

  return {
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    restoreEnrollment,
    addPayment,
  };
}
