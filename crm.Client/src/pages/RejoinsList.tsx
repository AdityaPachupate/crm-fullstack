import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRejoins } from '@/hooks/useRejoins';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/helpers';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  Loader2,
  Calendar,
  User,
  Package,
  History,
  Trash2,
  Undo2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RejoinsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showTrashed, setShowTrashed] = useState(false);
  
  const { data, isLoading, restoreRejoin } = useRejoins({ 
    isDeleted: showTrashed,
    pageSize: 100 
  });

  const items = data?.items || [];

  const filteredItems = items.filter(item => 
    ((item as any).leadName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* Header Area */}
      <div className="bg-white px-6 pt-8 pb-6 border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rejoins</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Returning patient management</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/rejoins/new')}
            className="h-11 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Rejoin
          </Button>
        </div>

        {/* Search & Main Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search patient name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-none rounded-xl text-sm font-medium focus-visible:ring-indigo-500"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full"
              >
                <X className="h-3 w-3 text-slate-400" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <Button
              variant={!showTrashed ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setShowTrashed(false)}
              className={cn(
                "h-9 px-5 rounded-full text-xs font-black uppercase tracking-wider transition-all",
                !showTrashed ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
              )}
            >
              Active Rejoins
            </Button>
            <Button
              variant={showTrashed ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setShowTrashed(true)}
              className={cn(
                "h-9 px-5 rounded-full text-xs font-black uppercase tracking-wider transition-all",
                showTrashed ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
              )}
            >
              Deleted
            </Button>
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading records...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">No rejoins found</p>
              <p className="text-xs text-slate-400 font-medium max-w-[200px] mt-1">
                {showTrashed ? "No deleted records in history." : "Try adjusting your filters or search terms."}
              </p>
            </div>
            {search && (
              <Button 
                variant="outline" 
                onClick={() => setSearch('')}
                className="mt-2 rounded-xl text-xs font-bold"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          filteredItems.map((rejoin) => (
            <Card 
              key={rejoin.id} 
              className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => navigate(`/leads/${rejoin.leadId}`)}
            >
              <CardContent className="p-0">
                <div className="p-5 flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                      <RefreshCw className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        {(rejoin as any).leadName || 'Unknown Patient'}
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Package className="h-3.5 w-3.5" />
                          {rejoin.packageName}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cost Snapshot</p>
                    <p className="text-lg font-black text-slate-900 tracking-tight">
                      {formatCurrency(rejoin.packageCostSnapshot)}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/50 px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Starts</p>
                      <p className="text-xs font-bold text-slate-700">{formatDate(rejoin.startDate)}</p>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-200" />
                    <div className="flex flex-col">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ends</p>
                      <p className="text-xs font-bold text-slate-700">{formatDate(rejoin.endDate)}</p>
                    </div>
                  </div>

                  {showTrashed ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl text-[10px] font-black uppercase tracking-wider h-8 px-4 bg-white border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all" 
                      disabled={restoreRejoin.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        restoreRejoin.mutate(rejoin.id);
                      }}
                    >
                      {restoreRejoin.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      ) : (
                        <Undo2 className="h-3 w-3 mr-2" />
                      )}
                      Restore
                    </Button>
                  ) : (
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      ID: {rejoin.id.substring(0, 8)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
