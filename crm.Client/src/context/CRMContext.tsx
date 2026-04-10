import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Lead, LeadStatus, FollowUp, TreatmentPackage, Medicine, Enrollment, Bill, Rejoin, LookupValue } from '@/types';
import { generateId, now } from '@/lib/helpers';

interface CRMState {
  leads: Lead[];
  followUps: FollowUp[];
  packages: TreatmentPackage[];
  medicines: Medicine[];
  enrollments: Enrollment[];
  bills: Bill[];
  rejoins: Rejoin[];
  lookups: LookupValue[];
}

interface CRMContextType extends CRMState {
  // Leads
  addLead: (l: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Lead;
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
}

const ALL_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Consulted', 'Qualified', 'Hot', 'Warm', 'Cold', 'Lost', 'Converted'];
const STORAGE_KEY = 'clinic_crm_data';

const defaultLookups: Omit<LookupValue, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>[] = [
  { category: 'LeadSource', code: 'walk_in', displayName: 'Walk-in' },
  { category: 'LeadSource', code: 'referral', displayName: 'Referral' },
  { category: 'LeadSource', code: 'online', displayName: 'Online' },
  { category: 'LeadSource', code: 'phone', displayName: 'Phone Inquiry' },
  { category: 'LeadReason', code: 'back_pain', displayName: 'Back Pain' },
  { category: 'LeadReason', code: 'weight_loss', displayName: 'Weight Loss' },
  { category: 'LeadReason', code: 'skin_care', displayName: 'Skin Care' },
  { category: 'LeadReason', code: 'general', displayName: 'General Wellness' },
];

function loadState(): CRMState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const ts = now();
  return {
    leads: [],
    followUps: [],
    packages: [],
    medicines: [],
    enrollments: [],
    bills: [],
    rejoins: [],
    lookups: defaultLookups.map(l => ({ ...l, id: generateId(), createdAt: ts, updatedAt: ts, deletedAt: null })),
  };
}

const CRMContext = createContext<CRMContextType | null>(null);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CRMState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const update = useCallback(<K extends keyof CRMState>(key: K, fn: (arr: CRMState[K]) => CRMState[K]) => {
    setState(s => ({ ...s, [key]: fn(s[key]) }));
  }, []);

  // Generic helpers
  const softDelete = <K extends keyof CRMState>(key: K, id: string) =>
    update(key, arr => arr.map((item: any) => item.id === id ? { ...item, deletedAt: now(), updatedAt: now() } : item) as CRMState[K]);
  const restore = <K extends keyof CRMState>(key: K, id: string) =>
    update(key, arr => arr.map((item: any) => item.id === id ? { ...item, deletedAt: null, updatedAt: now() } : item) as CRMState[K]);
  const hardDelete = <K extends keyof CRMState>(key: K, id: string) =>
    update(key, arr => arr.filter((item: any) => item.id !== id) as CRMState[K]);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://medicalcrm-api.onrender.com').replace(/\/$/, '');
  const LEADS_API_URL = `${API_BASE_URL}/api/leads`;

  const ctx: CRMContextType = {
    ...state,
    addLead: (l) => {
      // Create local temporary lead for immediate UI feedback
      const tempId = generateId();
      const lead: Lead = { ...l, id: tempId, createdAt: now(), updatedAt: now(), deletedAt: null };
      update('leads', arr => [...arr, lead]);

      // Perform background API call
      fetch(LEADS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: l.name,
          phone: l.phone,
          status: ALL_STATUSES.indexOf(l.status), // Backend expects int
          source: l.source,
          reason: l.reason
        })
      })
      .then(async res => {
        if (!res.ok) throw new Error('API Error');
        const savedLead = await res.json();
        // Update the temp lead with the real ID and data from server
        update('leads', arr => arr.map(x => x.id === tempId ? {
          ...x,
          id: savedLead.id,
          createdAt: savedLead.createdAt,
          updatedAt: savedLead.createdAt
        } : x));
      })
      .catch(err => {
        console.error('Failed to save lead to API:', err);
        // We might want to notify the user or handle rollback here
      });

      return lead;
    },
    updateLead: (id, l) => {
      update('leads', arr => arr.map(x => x.id === id ? { ...x, ...l, updatedAt: now() } : x));
      
      fetch(`${LEADS_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          ...l,
          status: l.status ? ALL_STATUSES.indexOf(l.status) : undefined
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
      if (outcome === 'Not Interested' || outcome === 'Wrong Number' || outcome === 'Disconnected') {
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
  };

  return <CRMContext.Provider value={ctx}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM must be used within CRMProvider');
  return ctx;
}
