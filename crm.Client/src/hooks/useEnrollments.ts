import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi, CreateEnrollmentRequest, UpdateEnrollmentRequest } from '@/api/enrollments.api';
import { LEADS_QUERY_KEY } from './useLeads';
import { toast } from 'sonner';

export const ENROLLMENTS_QUERY_KEY = ['enrollments'];

export function useEnrollment(id: string) {
  return useQuery({
    queryKey: [...ENROLLMENTS_QUERY_KEY, id],
    queryFn: () => enrollmentsApi.getById(id),
    enabled: !!id,
  });
}

export function useEnrollments() {
  const queryClient = useQueryClient();

  const createEnrollment = useMutation({
    mutationFn: (request: CreateEnrollmentRequest) => enrollmentsApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      toast.success('Enrollment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create enrollment');
    }
  });

  const updateEnrollment = useMutation({
    mutationFn: (request: UpdateEnrollmentRequest) => enrollmentsApi.update(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      // Also invalidate the specific lead detail if possible
      if (variables.leadId) {
         queryClient.invalidateQueries({ queryKey: [...LEADS_QUERY_KEY, variables.leadId] });
      }
      toast.success('Enrollment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update enrollment');
    }
  });

  const deleteEnrollment = useMutation({
    mutationFn: (id: string) => enrollmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      toast.success('Enrollment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete enrollment');
    }
  });

  return {
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
  };
}
