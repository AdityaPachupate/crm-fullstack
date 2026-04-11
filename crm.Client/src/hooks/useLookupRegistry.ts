import { useLookups } from './useLookups';
import { getStaticLookup, StaticLookupCategory, LookupMetadata } from '@/lib/lookup-registry';
import { useMemo } from 'react';

export type LookupRegistryCategory = StaticLookupCategory | 'LeadSource' | 'LeadReason';

export function useLookupRegistry() {
  const { data: dynamicLookups = [] } = useLookups();

  const getLookupMetadata = useMemo(() => {
    return (category: LookupRegistryCategory, code: string): LookupMetadata => {
      // 1. Check static registry first
      if (category === 'LeadStatus' || category === 'FollowUpOutcome' || category === 'FollowUpPriority') {
        return getStaticLookup(category, code);
      }

      // 2. Check dynamic lookups from API
      const dynamic = dynamicLookups.find(l => l.category === category && l.code === code);
      if (dynamic) {
        return {
          label: dynamic.displayName,
          color: 'text-slate-700',
          bgColor: 'bg-slate-50',
        };
      }

      // 3. Fallback
      return {
        label: code,
        color: 'text-slate-500',
        bgColor: 'bg-slate-50',
      };
    };
  }, [dynamicLookups]);

  return {
    getLookupMetadata,
    dynamicLookups,
  };
}
