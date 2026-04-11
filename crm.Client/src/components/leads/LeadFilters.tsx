import { useLeadsStore } from '@/store/useLeadsStore';
import { useLookups } from '@/hooks/useLookups';
import { LOOKUP_CATEGORIES } from '@/constants';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LeadFilters() {
  const { 
    sourceFilter, setSourceFilter,
    reasonFilter, setReasonFilter,
    hasEnrollmentFilter, setHasEnrollmentFilter,
    hasMedicineFilter, setHasMedicineFilter,
    resetFilters
  } = useLeadsStore();

  const { data: lookups = [] } = useLookups();

  const sources = lookups.filter(l => l.category === LOOKUP_CATEGORIES.LEAD_SOURCE);
  const reasons = lookups.filter(l => l.category === LOOKUP_CATEGORIES.LEAD_REASON);

  const activeFiltersCount = [
    sourceFilter !== 'All',
    reasonFilter !== 'All',
    hasEnrollmentFilter !== 'All',
    hasMedicineFilter !== 'All'
  ].filter(Boolean).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative h-9 px-3 gap-2 border-dashed">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your lead list using multiple criteria.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* Source Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Source</Label>
            <Select 
              value={sourceFilter === 'All' ? 'all' : sourceFilter} 
              onValueChange={(val) => setSourceFilter(val === 'all' ? 'All' : val)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map(s => (
                  <SelectItem key={s.id} value={s.displayName}>{s.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Reason</Label>
            <Select 
              value={reasonFilter === 'All' ? 'all' : reasonFilter} 
              onValueChange={(val) => setReasonFilter(val === 'all' ? 'All' : val)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Reasons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                {reasons.map(r => (
                  <SelectItem key={r.id} value={r.displayName}>{r.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggles */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Has Enrollment</Label>
                <p className="text-[11px] text-muted-foreground">Only show enrolled leads</p>
              </div>
              <Switch 
                checked={hasEnrollmentFilter === true}
                onCheckedChange={(checked) => setHasEnrollmentFilter(checked ? true : 'All')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Has Medicine</Label>
                <p className="text-[11px] text-muted-foreground">Only show medicine purchases</p>
              </div>
              <Switch 
                checked={hasMedicineFilter === true}
                onCheckedChange={(checked) => setHasMedicineFilter(checked ? true : 'All')}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 w-full">
            <Button variant="outline" className="flex-1 h-11" onClick={resetFilters}>
              Reset All
            </Button>
            <SheetClose asChild>
              <Button className="flex-1 h-11">Show Results</Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
