import { Medicine } from '@/types';
import { apiClient } from '@/lib/api-client';

export const medicinesApi = {
  getAll: async (isTrash: boolean = false): Promise<Medicine[]> => {
    return await apiClient<Medicine[]>(`/api/medicines?isTrash=${isTrash}`);
  },
  create: async (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Medicine> => {
    return await apiClient<Medicine>('/api/medicines', {
      method: 'POST',
      body: JSON.stringify(medicine),
    });
  },
  update: async (id: string, medicine: Partial<Medicine>): Promise<Medicine> => {
    return await apiClient<Medicine>(`/api/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...medicine }),
    });
  },
  delete: async (id: string): Promise<void> => {
    await apiClient(`/api/medicines/${id}`, { method: 'DELETE' });
  }
};
