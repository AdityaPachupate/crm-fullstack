import { Lead, LeadStatus, LeadDetail, LeadsParams, LeadsResponse } from '@/types';
import { apiClient } from '@/lib/api-client';
import { ALL_STATUSES, APP_CONFIG } from '@/constants';

export const leadsApi = {
  getAll: async (params: LeadsParams = {}): Promise<LeadsResponse> => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    query.set('pageSize', (params.pageSize || APP_CONFIG.DEFAULT_PAGE_SIZE).toString());
    if (params.pageNumber) query.set('pageNumber', params.pageNumber.toString());

    const data = await apiClient<any>(`/api/leads?${query.toString()}`);
    
    // Map API status (integer) to frontend status (string)
    if (data && data.items) {
      data.items = data.items.map((item: any) => ({
        ...item,
        status: ALL_STATUSES[item.status] || 'New',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt ?? item.createdAt,
        deletedAt: null, // API might not return this for list
      }));
    }
    
    return data;
  },

  getById: async (id: string): Promise<LeadDetail> => {
    const item = await apiClient<any>(`/api/leads/${id}`);
    return {
      ...item,
      status: ALL_STATUSES[item.status] || 'New',
    };
  },

  create: async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Lead> => {
    const data = await apiClient<any>('/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        status: ALL_STATUSES.indexOf(lead.status),
        source: lead.source,
        reason: lead.reason
      }),
    });
    return {
      ...data,
      status: ALL_STATUSES[data.status] || 'New',
    };
  },

  update: async (id: string, lead: Partial<Lead>): Promise<Lead> => {
    const updateData: any = { ...lead };
    if (lead.status) {
      updateData.status = ALL_STATUSES.indexOf(lead.status);
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
