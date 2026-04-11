import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PhoneCall, MoreHorizontal } from 'lucide-react';
import { usePrefetch } from '@/hooks/usePrefetch';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/follow-ups', icon: PhoneCall, label: 'Follow-ups' },
  { to: '/more', icon: MoreHorizontal, label: 'More' },
];

export default function BottomNav() {
  const location = useLocation();
  const { prefetchLeadsList, prefetchTodayFollowups } = usePrefetch();

  const handleMouseEnter = (to: string) => {
    if (to === '/leads') prefetchLeadsList();
    if (to === '/follow-ups') prefetchTodayFollowups();
  };

  return (
    <nav className="fixed inset-x-0 bottom-3 z-50">
      <div className="mx-auto max-w-lg px-3">
        <div className="flex items-center rounded-2xl border bg-card/95 px-2 py-1.5 shadow-lg backdrop-blur-sm">
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
      </div>
    </nav>
  );
}
