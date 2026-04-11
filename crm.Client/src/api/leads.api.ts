import { Lead, LeadStatus, LeadDetail, LeadsParams, LeadsResponse } from '@/types';
import { apiClient } from '@/lib/api-client';
import { ALL_STATUSES, APP_CONFIG } from '@/constants';

export const leadsApi = {
  getAll: async (params: LeadsParams = {}): Promise<LeadsResponse> => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.source && params.source !== 'All') query.append('source', params.source);
    if (params.reason && params.reason !== 'All') query.append('reason', params.reason);
    if (params.hasEnrollment !== undefined && params.hasEnrollment !== 'All') query.append('hasEnrollment', params.hasEnrollment.toString());
    if (params.hasMedicine !== undefined && params.hasMedicine !== 'All') query.append('hasMedicine', params.hasMedicine.toString());
    if (params.pageNumber) query.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) query.append('pageSize', params.pageSize.toString());
    
    const data = await apiClient<any>(`/api/leads?${query.toString()}`);
    
    if (data && data.items) {
      data.items = data.items.map((item: any) => ({
        ...item,
        status: item.status as LeadStatus,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt ?? item.createdAt,
        deletedAt: null,
      }));
    }
    
    return data;
  },

  getById: async (id: string): Promise<LeadDetail> => {
    const item = await apiClient<any>(`/api/leads/${id}`);
    return {
      ...item,
      status: item.status as LeadStatus,
    };
  },

  create: async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Lead> => {
    const data = await apiClient<any>('/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        status: lead.status,
        source: lead.source,
        reason: lead.reason
      }),
    });
    return {
      ...data,
      status: data.status as LeadStatus,
    };
  },

  update: async (id: string, lead: Partial<Lead>): Promise<Lead> => {
    const updateData: any = { ...lead };
    if (lead.status) {
      updateData.status = lead.status;
    }
    
    const data = await apiClient<any>(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id,
        ...updateData
      }),
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient(`/api/leads/${id}`, { method: 'DELETE' });
  }
};
