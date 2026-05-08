import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, User, Phone, ChevronRight, Loader2 } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { maskPhone } from '@/lib/helpers';
import { cn } from '@/lib/utils';

interface LeadSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (leadId: string) => void;
}

export function LeadSearchDialog({ isOpen, onClose, onSelect }: LeadSearchDialogProps) {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useLeads({ search, pageSize: 5 });

  const leads = data?.items || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-[425px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl focus:outline-none">
        <div className="flex flex-col max-h-[85vh]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Find Patient</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-400">
              Search for a patient to schedule a follow-up
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input 
                placeholder="Search name or phone..." 
                className="pl-10 h-12 bg-slate-50 border-none rounded-2xl text-sm focus-visible:ring-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
            <div className="space-y-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="relative">
                    <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-indigo-400/20 rounded-full animate-pulse" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Searching Leads</p>
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                  <User className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">No patients found</p>
                </div>
              ) : (
                leads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => {
                      onSelect(lead.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-indigo-50/50 border border-slate-100 rounded-2xl transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm">
                        <User className="h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{lead.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400">{maskPhone(lead.phone)}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))
              )}
            </div>
          </div>
          
          <div className="p-4 bg-slate-50/50 border-t border-slate-100">
            <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest">
              Showing top results for "{search || '...'}"
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
