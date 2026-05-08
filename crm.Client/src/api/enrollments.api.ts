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
  delete: async (id: string, isPermanent: boolean = false): Promise<void> => {
    await apiClient(`/api/enrollments/${id}${isPermanent ? '?isPermanent=true' : ''}`, { method: 'DELETE' });
  },
  restore: async (id: string): Promise<void> => {
    await apiClient(`/api/enrollments/${id}/restore`, { method: 'POST' });
  },
  getAll: async (params?: { 
    pageNumber?: number; 
    pageSize?: number; 
    isTrash?: boolean;
    isActive?: boolean;
    startDateFrom?: string;
    startDateTo?: string;
    search?: string;
    packageId?: string;
    isPending?: boolean;
    sortBy?: string;
  }): Promise<{ items: any[]; totalCount: number }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return await apiClient<{ items: any[]; totalCount: number }>(`/api/enrollments${queryString ? `?${queryString}` : ''}`);
  },
  addPayment: async (billId: string, amount: number): Promise<{ success: boolean; message: string }> => {
    return await apiClient<{ success: boolean; message: string }>(`/api/bills/${billId}/payments`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }
};
