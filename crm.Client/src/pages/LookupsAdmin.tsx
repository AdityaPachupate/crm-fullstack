import { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import PageHeader from '@/components/layout/PageHeader';
import { LookupCategory } from '@/types';
import { ChevronDown, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function LookupsAdmin() {
  return (
    <div>
      <PageHeader title="Configure Dropdowns" back />
      <div className="space-y-4 p-5">
        <LookupSection category="LeadSource" title="Patient Sources" />
        <LookupSection category="LeadReason" title="Patient Reasons" />
      </div>
    </div>
  );
}

function LookupSection({ category, title }: { category: LookupCategory; title: string }) {
  const { lookups, addLookup, softDeleteLookup, restoreLookup } = useCRM();
  const items = lookups.filter(l => l.category === category);
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimCode = code.trim().replace(/\s/g, '_').toLowerCase();
    if (!trimCode || trimCode.length > 50) { setError('Code must be 1-50 chars, no spaces'); return; }
    if (!displayName.trim() || displayName.trim().length > 100) { setError('Display name must be 1-100 chars'); return; }
    if (items.some(l => l.code === trimCode && !l.deletedAt)) { setError('Code already exists'); return; }
    addLookup({ category, code: trimCode, displayName: displayName.trim() });
    setCode(''); setDisplayName(''); setAdding(false); setError('');
    toast.success('Value added');
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-muted px-4 py-3">
        <span className="text-sm font-semibold">{title}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        <div className="divide-y rounded-lg border">
          {items.map(item => (
            <div key={item.id} className={`flex items-center justify-between px-4 py-3 ${item.deletedAt ? 'opacity-40' : ''}`}>
              <div>
                <p className="text-sm font-medium">{item.displayName}</p>
                <p className="font-mono text-xs text-muted-foreground">{item.code}</p>
              </div>
              <Switch
                checked={!item.deletedAt}
                onCheckedChange={() => item.deletedAt ? restoreLookup(item.id) : softDeleteLookup(item.id)}
              />
            </div>
          ))}
        </div>
        {adding ? (
          <div className="mt-2 space-y-3 rounded-lg border p-4">
            <div><Label className="text-xs font-medium text-muted-foreground">Code</Label><Input value={code} onChange={e => setCode(e.target.value.replace(/\s/g, ''))} placeholder="e.g. social_media" className="mt-1.5 h-9 rounded-lg text-sm" maxLength={50} /></div>
            <div><Label className="text-xs font-medium text-muted-foreground">Display Name</Label><Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Social Media" className="mt-1.5 h-9 rounded-lg text-sm" maxLength={100} /></div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 rounded-full text-xs" onClick={handleAdd}>Add</Button>
              <Button size="sm" variant="outline" className="flex-1 rounded-full text-xs" onClick={() => { setAdding(false); setError(''); }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="mt-2 w-full rounded-full text-xs" onClick={() => setAdding(true)}>
            <Plus className="mr-1 h-3 w-3" /> New value
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
