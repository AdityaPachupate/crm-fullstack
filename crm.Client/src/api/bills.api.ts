import { BillDto, BillsResponse } from '@/types';
import { apiClient } from '@/lib/api-client';

export interface BillDetailDto extends BillDto {
  packageName: string;
  items: {
    medicineId: string;
    medicineName: string;
    quantity: number;
    unitPriceAtSale: number;
  }[];
  payments: {
    id: string;
    amount: number;
    datePaid: string;
    isDeleted: boolean;
  }[];
}

export const billsApi = {
  getLeadBills: async (leadId: string): Promise<BillDetailDto[]> => {
    return apiClient<BillDetailDto[]>(`/api/leads/${leadId}/bills`);
  },

  getAllBills: async (isTrash: boolean = false): Promise<BillsResponse> => {
    return apiClient<BillsResponse>(`/api/bills?isTrash=${isTrash}`);
  },

  addPayment: async (billId: string, amount: number): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>(`/api/bills/${billId}/payments`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  deletePayment: async (billId: string, paymentId: string, isHard: boolean = false): Promise<{ success: boolean; message: string }> => {
    const url = `/api/bills/${billId}/payments/${paymentId}${isHard ? '?hard=true' : ''}`;
    return apiClient<{ success: boolean; message: string }>(url, {
      method: 'DELETE'
    });
  },

  deleteBill: async (billId: string, isPermanent: boolean = false): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/bills/${billId}${isPermanent ? '?isPermanent=true' : ''}`, {
      method: 'DELETE',
    });
  },

  create: async (request: any): Promise<any> => {
    return apiClient<any>('/api/bills', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  restore: async (id: string): Promise<void> => {
    await apiClient(`/api/bills/${id}/restore`, { method: 'POST' });
  }
};
