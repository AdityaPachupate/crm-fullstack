import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Lead, LeadStatus, FollowUp, TreatmentPackage, Medicine, Enrollment, Bill, Rejoin, LookupValue } from '@/types';
import { generateId, now } from '@/lib/helpers';
import { toast } from 'sonner';

interface CRMState {
  leads: Lead[];
  leadsCount: number;
  followUps: FollowUp[];
  packages: TreatmentPackage[];
  medicines: Medicine[];
  enrollments: Enrollment[];
  bills: Bill[];
  rejoins: Rejoin[];
  lookups: LookupValue[];
  loading: boolean;
  error: string | null;
}

interface CRMContextType extends CRMState {
  // Leads
  addLead: (l: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Promise<Lead>;
  updateLead: (id: string, l: Partial<Lead>) => void;
  softDeleteLead: (id: string) => void;
  restoreLead: (id: string) => void;
  hardDeleteLead: (id: string) => void;
  // Follow-ups
  addFollowUp: (f: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'completedAt' | 'outcome' | 'outcomeNotes'>) => FollowUp;
  completeFollowUp: (id: string, outcome: FollowUp['outcome'], outcomeNotes: string, nextFollowUp?: { followUpDate: string; priority: FollowUp['priority']; contactMedium: string; notes: string; leadId: string }) => void;
  softDeleteFollowUp: (id: string) => void;
  restoreFollowUp: (id: string) => void;
  hardDeleteFollowUp: (id: string) => void;
  // Packages
  addPackage: (p: Omit<TreatmentPackage, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => TreatmentPackage;
  updatePackage: (id: string, p: Partial<TreatmentPackage>) => void;
  softDeletePackage: (id: string) => void;
  restorePackage: (id: string) => void;
  // Medicines
  addMedicine: (m: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Medicine;
  updateMedicine: (id: string, m: Partial<Medicine>) => void;
  softDeleteMedicine: (id: string) => void;
  restoreMedicine: (id: string) => void;
  // Enrollments
  addEnrollment: (e: Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Enrollment;
  updateEnrollment: (id: string, e: Partial<Enrollment>) => void;
  softDeleteEnrollment: (id: string) => void;
  restoreEnrollment: (id: string) => void;
  hardDeleteEnrollment: (id: string) => void;
  // Bills
  addBill: (b: Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Bill;
  softDeleteBill: (id: string) => void;
  restoreBill: (id: string) => void;
  hardDeleteBill: (id: string) => void;
  // Rejoins
  addRejoin: (r: Omit<Rejoin, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Rejoin;
  softDeleteRejoin: (id: string) => void;
  restoreRejoin: (id: string) => void;
  hardDeleteRejoin: (id: string) => void;
  // Lookups
  addLookup: (l: Omit<LookupValue, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => LookupValue;
  updateLookup: (id: string, l: Partial<LookupValue>) => void;
  softDeleteLookup: (id: string) => void;
  restoreLookup: (id: string) => void;
  refreshLeads: (params?: { status?: string; search?: string }) => Promise<void>;
}

import { APP_CONFIG, LOOKUP_CATEGORIES } from '@/constants';

const defaultLookups: Omit<LookupValue, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>[] = [
  { category: LOOKUP_CATEGORIES.LEAD_SOURCE, code: 'walk_in', displayName: 'Walk-in' },
  { category: LOOKUP_CATEGORIES.LEAD_SOURCE, code: 'referral', displayName: 'Referral' },
  { category: LOOKUP_CATEGORIES.LEAD_SOURCE, code: 'online', displayName: 'Online' },
  { category: LOOKUP_CATEGORIES.LEAD_SOURCE, code: 'phone', displayName: 'Phone Inquiry' },
  { category: LOOKUP_CATEGORIES.LEAD_REASON, code: 'back_pain', displayName: 'Back Pain' },
  { category: LOOKUP_CATEGORIES.LEAD_REASON, code: 'weight_loss', displayName: 'Weight Loss' },
  { category: LOOKUP_CATEGORIES.LEAD_REASON, code: 'skin_care', displayName: 'Skin Care' },
  { category: LOOKUP_CATEGORIES.LEAD_REASON, code: 'general', displayName: 'General Wellness' },
];

function loadState(): CRMState {
  try {
    const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const ts = now();
  return {
    leads: [],
    leadsCount: 0,
    followUps: [],
    packages: [],
    medicines: [],
    enrollments: [],
    bills: [],
    rejoins: [],
    lookups: defaultLookups.map(l => ({ ...l, id: generateId(), createdAt: ts, updatedAt: ts, deletedAt: null })),
    loading: false,
    error: null,
  };
}

const CRMContext = createContext<CRMContextType | null>(null);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CRMState>(loadState);

  useEffect(() => {
    localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://crm-api-1ugj.onrender.com').replace(/\/$/, '');
  const LEADS_API_URL = `${API_BASE_URL}/api/leads`;
  const LOOKUPS_API_URL = `${API_BASE_URL}/api/lookups`;

  // Initial Sync from API
  useEffect(() => {
    // Sync Leads
    fetch(LEADS_API_URL)
      .then(res => res.json())
      .then(data => {
        if (data && data.items) {
          const apiLeads: Lead[] = data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            phone: item.phone,
            status: item.status || 'New',
            source: item.source,
            reason: item.reason,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt ?? item.createdAt,
            deletedAt: null,
          }));
          setState(s => ({ ...s, leads: apiLeads }));
        }
      })
      .catch(err => console.error('Failed to sync leads from API:', err));

    // Sync Lookups
    fetch(`${LOOKUPS_API_URL}?pageSize=200`)
      .then(res => res.json())
      .then(data => {
        if (data && data.items) {
          const apiLookups: LookupValue[] = data.items.map((item: any) => ({
            id: item.id,
            category: item.category,
            code: item.code,
            displayName: item.displayName,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt ?? item.createdAt,
            deletedAt: item.deletedAt,
          }));
          setState(s => ({ ...s, lookups: apiLookups }));
        }
      })
      .catch(err => console.error('Failed to sync lookups from API:', err));
  }, [LEADS_API_URL, LOOKUPS_API_URL]);

  const update = useCallback(<K extends keyof CRMState>(key: K, fn: (arr: CRMState[K]) => CRMState[K]) => {
    setState(s => ({ ...s, [key]: fn(s[key]) }));
  }, []);

  const refreshLeads = useCallback(async (params?: { status?: string; search?: string }) => {
    try {
      setState(s => ({ ...s, loading: true, error: null }));
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.search) query.set('search', params.search);
      query.set('pageSize', '100');

      const res = await fetch(`${LEADS_API_URL}?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();
      
      if (data && data.items) {
        const apiLeads: Lead[] = data.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          status: item.status || 'New',
          source: item.source,
          reason: item.reason,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt ?? item.createdAt,
          deletedAt: null,
        }));
        setState(s => ({ ...s, leads: apiLeads, leadsCount: data.totalCount, loading: false }));
      }
    } catch (err) {
      setState(s => ({ ...s, error: (err as Error).message, loading: false }));
    }
  }, [LEADS_API_URL]);

  // Generic helpers
  // Generic helpers for array-based state
  type ArrayStateKeys = 'leads' | 'followUps' | 'packages' | 'medicines' | 'enrollments' | 'bills' | 'rejoins' | 'lookups';

  const softDelete = <K extends ArrayStateKeys>(key: K, id: string) =>
    update(key, arr => (arr as any[]).map((item: any) => item.id === id ? { ...item, deletedAt: now(), updatedAt: now() } : item) as CRMState[K]);
  
  const restore = <K extends ArrayStateKeys>(key: K, id: string) =>
    update(key, arr => (arr as any[]).map((item: any) => item.id === id ? { ...item, deletedAt: null, updatedAt: now() } : item) as CRMState[K]);
  
  const hardDelete = <K extends ArrayStateKeys>(key: K, id: string) =>
    update(key, arr => (arr as any[]).filter((item: any) => item.id !== id) as CRMState[K]);


  const ctx: CRMContextType = {
    ...state,
    addLead: async (l) => {
      const tempId = generateId();
      const lead: Lead = { ...l, id: tempId, createdAt: now(), updatedAt: now(), deletedAt: null };
      update('leads', arr => [...arr, lead]);

      try {
        const res = await fetch(LEADS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: l.name,
            phone: l.phone,
            status: l.status,
            source: l.source,
            reason: l.reason
          })
        });

        if (res.status === 409) {
          // Rollback
          update('leads', arr => arr.filter(x => x.id !== tempId));
          toast.error('This phone number is already registered to another lead');
          throw new Error('Conflict');
        }

        if (!res.ok) {
          // Rollback
          update('leads', arr => arr.filter(x => x.id !== tempId));
          toast.error('Failed to create lead');
          throw new Error('API Error');
        }

        const savedLead = await res.json();
        update('leads', arr => arr.map(x => x.id === tempId ? {
          ...x,
          id: savedLead.id,
          createdAt: savedLead.createdAt,
          updatedAt: savedLead.createdAt
        } : x));
        
        return { ...lead, id: savedLead.id, createdAt: savedLead.createdAt };
      } catch (err) {
        // Already handled rollback in res.status blocks, but for network errors:
        if ((err as Error).message !== 'Conflict' && (err as Error).message !== 'API Error') {
          update('leads', arr => arr.filter(x => x.id !== tempId));
          toast.error('Network error. Lead not saved.');
        }
        throw err;
      }
    },
    updateLead: (id, l) => {
      update('leads', arr => arr.map(x => x.id === id ? { ...x, ...l, updatedAt: now() } : x));
      
      fetch(`${LEADS_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          ...l,
          status: l.status
        })
      }).catch(err => console.error('Failed to update lead in API:', err));
    },
    softDeleteLead: (id) => softDelete('leads', id),
    restoreLead: (id) => restore('leads', id),
    hardDeleteLead: (id) => hardDelete('leads', id),

    addFollowUp: (f) => {
      const fu: FollowUp = { ...f, id: generateId(), createdAt: now(), updatedAt: now(), deletedAt: null, completedAt: null, outcome: null, outcomeNotes: '' };
      update('followUps', arr => [...arr, fu]);
      return fu;
    },
    completeFollowUp: (id, outcome, outcomeNotes, nextFollowUp) => {
      update('followUps', arr => arr.map(x => x.id === id ? { ...x, completedAt: now(), outcome, outcomeNotes, updatedAt: now() } : x));
      if (nextFollowUp) {
        const fu: FollowUp = { ...nextFollowUp, id: generateId(), createdAt: now(), updatedAt: now(), deletedAt: null, completedAt: null, outcome: null, outcomeNotes: '' };
        update('followUps', arr => [...arr, fu]);
      }
      // Mark lead as Lost if outcome is negative
      if (outcome === 'NotInterested' || outcome === 'WrongNumber' || outcome === 'Disconnected') {
        const followUp = state.followUps.find(f => f.id === id);
        if (followUp) {
          update('leads', arr => arr.map(x => x.id === followUp.leadId ? { ...x, status: 'Lost' as const, updatedAt: now() } : x));
        }
      }
    },
    softDeleteFollowUp: (id) => softDelete('followUps', id),
    restoreFollowUp: (id) => restore('followUps', id),
    hardDeleteFollowUp: (id) => hardDelete('followUps', id),

    addPackage: (p) => {
      const pkg: TreatmentPackage = { ...p, id: generateId(), createdAt: now(), updatedAt: now(), deletedAt: null };
      update('packages', arr => [...arr, pkg]);
      return pkg;
    },
    updatePackage: (id, p) => update('packages', arr => arr.map(x => x.id === id ? { ...x, ...p, updatedAt: now() } : x)),
    softDeletePackage: (id) => softDelete('packages', id),
    restorePackage: (id) => restore('packages', id),

    addMedicine: (m) => {
      const med: Medicine = { ...m, id: generateId(), createdAt: now(), updatedAt: now(), deletedAt: null };
      update('medicines', arr => [...arr, med]);
      return med;
    },
    updateMedicine: (id, m) => update('medicines', arr => arr.map(x => x.id === id ? { ...x, ...m, updatedAt: now() } : x)),
    softDeleteMedicine: (id) => softDelete('medicines', id),
    restoreMedicine: (id) => restore('medicines', id),

    addEnrollment: (e) => {
      const enr: Enrollment = { ...e, id: generateId(), createdAt: now(), updatedAt: now(), deletedAt: null };
      update('enrollments', arr => [...arr, enr]);
      return enr;
    },
    updateEnrollment: (id, e) => update('enrollments', arr => arr.map(x => x.id === id ? { ...x, ...e, updatedAt: now() } : x)),
    softDeleteEnrollment: (id) => softDelete('enrollments', id),
    restoreEnrollment: (id) => restore('enrollments', id),
    hardDeleteEnrollment: (id) => hardDelete('enrollments', id),

    addBill: (b) => {
      const bill: Bill = { ...b, id: generateId(), createdAt: now(), updatedAt: now(), deletedAt: null };
      update('bills', arr => [...arr, bill]);
      return bill;
    },
    softDeleteBill: (id) => softDelete('bills', id),
    restoreBill: (id) => restore('bills', id),
    hardDeleteBill: (id) => hardDelete('bills', id),

    addRejoin: (r) => {
      const rejoin: Rejoin = { ...r, id: generateId(), createdAt: now(), updatedAt: now(), deletedAt: null };
      update('rejoins', arr => [...arr, rejoin]);
      return rejoin;
    },
    softDeleteRejoin: (id) => softDelete('rejoins', id),
    restoreRejoin: (id) => restore('rejoins', id),
    hardDeleteRejoin: (id) => hardDelete('rejoins', id),

    addLookup: (l) => {
      const lookup: LookupValue = { ...l, id: generateId(), createdAt: now(), updatedAt: now(), deletedAt: null };
      update('lookups', arr => [...arr, lookup]);
      return lookup;
    },
    updateLookup: (id, l) => update('lookups', arr => arr.map(x => x.id === id ? { ...x, ...l, updatedAt: now() } : x)),
    softDeleteLookup: (id) => softDelete('lookups', id),
    restoreLookup: (id) => restore('lookups', id),
    refreshLeads,
  };

  return <CRMContext.Provider value={ctx}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM must be used within CRMProvider');
  return ctx;
}
