import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PhoneCall, MoreHorizontal, ChevronDown, Menu } from 'lucide-react';
import { usePrefetch } from '@/hooks/usePrefetch';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Patients' },
  { to: '/follow-ups', icon: PhoneCall, label: 'Follow-ups' },
  { to: '/more', icon: MoreHorizontal, label: 'More' },
];

export default function BottomNav() {
  const location = useLocation();
  const { prefetchLeadsList, prefetchTodayFollowups } = usePrefetch();
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMouseEnter = (to: string) => {
    if (to === '/leads') prefetchLeadsList();
    if (to === '/follow-ups') prefetchTodayFollowups();
  };

  return (
    <div className="fixed bottom-3 right-0 left-0 z-50 flex justify-center pointer-events-none">
      <div className="max-w-lg w-full px-3 flex items-center justify-end gap-2 pointer-events-auto">
        <div className={cn(
          "flex-1 h-14 flex items-center rounded-2xl border bg-card/95 px-2 shadow-lg backdrop-blur-sm transition-all duration-300 origin-right",
          isMinimized ? "scale-0 opacity-0 pointer-events-none w-0 absolute" : "scale-100 opacity-100"
        )}>
          {tabs.map(({ to, icon: Icon, label }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onMouseEnter={() => handleMouseEnter(to)}
                className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[11px] transition-colors ${
                  active ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${active ? 'bg-primary/15 text-primary' : ''}`}>
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                </span>
                {label}
              </NavLink>
            );
          })}
        </div>

        <Button
          onClick={() => setIsMinimized(!isMinimized)}
          className={cn(
            "h-14 w-14 shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center backdrop-blur-sm",
            isMinimized 
              ? "rounded-full bg-slate-900 text-white" 
              : "rounded-2xl bg-card/95 border text-muted-foreground hover:text-foreground"
          )}
          size="icon"
        >
          {isMinimized ? <Menu className="h-6 w-6" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
