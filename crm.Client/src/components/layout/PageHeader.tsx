import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, back, right }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-40 flex items-center gap-3 border-b bg-card/95 backdrop-blur-sm px-4 py-3">
      {back && (
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
