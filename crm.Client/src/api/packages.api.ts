import { TreatmentPackage } from '@/types';
import { apiClient } from '@/lib/api-client';

export const packagesApi = {
  getAll: async (isTrash: boolean = false): Promise<TreatmentPackage[]> => {
    const data = await apiClient<any[]>(`/api/packages?isTrash=${isTrash}`);
    return data.map(p => ({
      ...p,
      durationDays: p.durationInDays // Map backend to frontend naming
    }));
  },
  getById: async (id: string): Promise<TreatmentPackage> => {
    const p = await apiClient<any>(`/api/packages/${id}`);
    return {
      ...p,
      durationDays: p.durationInDays || p.durationDays // Support both just in case
    };
  },
  create: async (pkg: Omit<TreatmentPackage, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<TreatmentPackage> => {
    return await apiClient<TreatmentPackage>('/api/packages', {
      method: 'POST',
      body: JSON.stringify(pkg),
    });
  },
  update: async (id: string, pkg: Partial<TreatmentPackage>): Promise<TreatmentPackage> => {
    return await apiClient<TreatmentPackage>(`/api/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...pkg }),
    });
  },
  delete: async (id: string): Promise<void> => {
    await apiClient(`/api/packages/${id}`, { method: 'DELETE' });
  }
};
