import { BillDto } from '@/types';
import { apiClient } from '@/lib/api-client';

export interface BillDetailDto extends BillDto {
  packageName: string;
  items: {
    medicineId: string;
    medicineName: string;
    quantity: number;
    unitPriceAtSale: number;
  }[];
}

export const billsApi = {
  getLeadBills: async (leadId: string): Promise<BillDetailDto[]> => {
    return apiClient<BillDetailDto[]>(`/api/leads/${leadId}/bills`);
  },

  addPayment: async (billId: string, amount: number): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>(`/api/bills/${billId}/payments`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }
};
