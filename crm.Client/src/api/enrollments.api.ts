import { EnrollmentDto, EnrollmentDetailDto } from '@/types';
import { apiClient } from '@/lib/api-client';

export interface CreateEnrollmentRequest {
  leadId: string;
  packageId: string;
  startDate: string;
  amountPaid: number;
  medicineItems?: { medicineId: string; quantity: number }[];
}

export interface UpdateEnrollmentRequest {
  id: string;
  leadId?: string;
  packageId?: string;
  startDate?: string;
  endDate?: string;
  packageCostSnapshot?: number;
  packageDurationSnapshot?: number;
  // Note: Backend might need update to support medicineItems update
}

export const enrollmentsApi = {
  getById: async (id: string): Promise<EnrollmentDetailDto> => {
    return await apiClient<EnrollmentDetailDto>(`/api/enrollments/${id}`);
  },
  create: async (request: CreateEnrollmentRequest): Promise<EnrollmentDto> => {
    return await apiClient<EnrollmentDto>('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  update: async (request: UpdateEnrollmentRequest): Promise<EnrollmentDto> => {
    return await apiClient<EnrollmentDto>(`/api/enrollments/${request.id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },
  delete: async (id: string): Promise<void> => {
    await apiClient(`/api/enrollments/${id}`, { method: 'DELETE' });
  }
};
