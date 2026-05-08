import { RejoinRecordDto, LeadsResponse } from '@/types';
import { apiClient } from '@/lib/api-client';

export interface CreateRejoinRequest {
  leadId: string;
  packageId: string;
  startDate: string;
}

export interface UpdateRejoinRequest {
  id: string;
  leadId?: string;
  packageId?: string;
  startDate?: string;
  endDate?: string;
  packageCostSnapshot?: number;
  packageDurationSnapshot?: number;
}

export interface GetRejoinsParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isTrash?: boolean;
}

export interface RejoinsResponse {
  items: RejoinRecordDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const rejoinsApi = {
  getAll: async (params?: GetRejoinsParams): Promise<RejoinsResponse> => {
    const query = new URLSearchParams();
    if (params?.pageNumber) query.set('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.isTrash !== undefined) query.set('isTrash', params.isTrash.toString());
    
    return apiClient<RejoinsResponse>(`/api/rejoins?${query.toString()}`);
  },

  getById: async (id: string): Promise<RejoinRecordDto> => {
    return apiClient<RejoinRecordDto>(`/api/rejoins/${id}`);
  },

  create: async (request: CreateRejoinRequest): Promise<{ id: string }> => {
    return apiClient<{ id: string }>('/api/rejoins', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  update: async (request: UpdateRejoinRequest): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/rejoins/${request.id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  delete: async (id: string, isPermanent: boolean = false): Promise<{ success: boolean }> => {
    const endpoint = isPermanent ? `/api/rejoins/${id}?isPermanent=true` : `/api/rejoin-records/${id}/trash`;
    return apiClient<{ success: boolean }>(endpoint, {
      method: isPermanent ? 'DELETE' : 'POST',
    });
  },

  restore: async (id: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/rejoins/${id}/restore`, {
      method: 'POST',
    });
  }
};
