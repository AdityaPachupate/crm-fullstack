import { apiClient } from '@/lib/api-client';

export interface DashboardStatDistribution {
  name: string;
  value: number;
}

export interface PriorityTask {
  id: string;
  leadName: string;
  followUpDate: string;
  notes: string;
  priority: string;
  isOverdue: boolean;
}

export interface DashboardStats {
  totalPatients: number;
  patientsTrend: string;
  activeEnrollments: number;
  enrollmentsTrend: string;
  todayTasks: number;
  overdueTasks: number;
  tasksTrend: string;
  pendingBilling: number;
  billingTrend: string;
  statusDistribution: DashboardStatDistribution[];
  sourceDistribution: DashboardStatDistribution[];
  priorityTasks: PriorityTask[];
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return await apiClient<DashboardStats>('/api/dashboard/stats');
  },
};
