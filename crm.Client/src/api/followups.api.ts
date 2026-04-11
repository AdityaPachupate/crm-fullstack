import { FollowUpDto, FollowUpPriority, FollowUpOutcome, LeadStatus } from '@/types';
import { apiClient } from '@/lib/api-client';
import { ALL_STATUSES } from '@/constants';

const PRIORITIES: FollowUpPriority[] = ['Low', 'Medium', 'High'];
const OUTCOMES: FollowUpOutcome[] = [
  'None',
  'Busy',
  'Not Interested',
  'Callback Requested',
  'Converted',
  'Wrong Number',
  'Disconnected'
];

export interface CreateFollowUpRequest {
  leadId: string;
  followUpDate: string;
  priority: FollowUpPriority;
  notes: string;
  source: string;
}

export interface CompleteFollowUpRequest {
  followUpId: string;
  outcome: FollowUpOutcome;
  notes: string;
  newLeadStatus?: LeadStatus;
  nextFollowUpDate?: string;
  nextFollowUpPriority?: FollowUpPriority;
}

export const followupsApi = {
  getAllToday: async (): Promise<FollowUpDto[]> => {
    return apiClient<FollowUpDto[]>('/api/followups/today');
  },

  create: async (request: CreateFollowUpRequest): Promise<FollowUpDto> => {
    return apiClient<FollowUpDto>('/api/followups', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        priority: PRIORITIES.indexOf(request.priority),
      }),
    });
  },

  complete: async (id: string, request: CompleteFollowUpRequest): Promise<void> => {
    return apiClient<void>(`/api/followups/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({
        ...request,
        outcome: OUTCOMES.indexOf(request.outcome),
        newLeadStatus: request.newLeadStatus ? ALL_STATUSES.indexOf(request.newLeadStatus) : null,
        nextFollowUpPriority: request.nextFollowUpPriority ? PRIORITIES.indexOf(request.nextFollowUpPriority) : null,
      }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiClient<void>(`/api/followups/${id}`, { method: 'DELETE' });
  }
};
