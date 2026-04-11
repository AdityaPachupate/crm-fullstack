import { Link } from 'react-router-dom';
import { Package, Pill, RefreshCw, Settings, Trash2, Receipt, ChevronRight } from 'lucide-react';

const items = [
  { to: '/packages', label: 'Packages', desc: 'Treatment packages catalog', icon: Package },
  { to: '/medicines', label: 'Medicines', desc: 'Medicine inventory', icon: Pill },
  { to: '/enrollments', label: 'Enrollments', desc: 'Patient enrollments', icon: Receipt },
  { to: '/bills/new', label: 'Create Bill', desc: 'Standalone billing', icon: Receipt },
  { to: '/rejoins', label: 'Rejoins', desc: 'Returning patients', icon: RefreshCw },
  { to: '/settings/lookups', label: 'Configure Dropdowns', desc: 'Patient sources & reasons', icon: Settings },
  { to: '/trash', label: 'Trash', desc: 'Deleted items', icon: Trash2 },
];

export default function MoreMenu() {
  return (
    <div>
      <div className="border-b bg-card/95 backdrop-blur-sm px-5 py-4">
        <h1 className="text-base font-semibold tracking-tight">More</h1>
      </div>
      <div className="divide-y">
        {items.map(item => (
          <Link key={item.to} to={item.to} className="block">
            <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
