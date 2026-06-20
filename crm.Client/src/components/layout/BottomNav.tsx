import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PhoneCall, MoreHorizontal, Menu, Minimize2 } from 'lucide-react';
import { usePrefetch } from '@/hooks/usePrefetch';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Patients' },
  { to: '/follow-ups', icon: PhoneCall, label: 'Follow-ups' },
  { to: '/more', icon: MoreHorizontal, label: 'More' },
];

const MARGIN = 12;

export default function BottomNav() {
  const location = useLocation();
  const { prefetchLeadsList, prefetchTodayFollowups } = usePrefetch();
  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      const saved = localStorage.getItem('bottom-nav-minimized');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  
  // Position offsets relative to default screen position (centered bottom)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('bottom-nav-position');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse bottom-nav-position from localStorage:', e);
    }
    return { x: 0, y: 0 };
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isPointerDownRef = useRef(false);

  const handleMouseEnter = (to: string) => {
    if (to === '/leads') prefetchLeadsList();
    if (to === '/follow-ups') prefetchTodayFollowups();
  };

  // Helper to clamp positions to keep the component fully within the viewport margins
  const constrainPosition = (
    targetX: number,
    targetY: number,
    currentPos: { x: number; y: number }
  ) => {
    if (!containerRef.current) return { x: targetX, y: targetY };

    const rect = containerRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const elementW = rect.width;
    const elementH = rect.height;

    // Calculate natural top/left relative to current position offset
    const naturalLeft = rect.left - currentPos.x;
    const naturalTop = rect.top - currentPos.y;

    const newLeft = naturalLeft + targetX;
    const newRight = newLeft + elementW;
    const newTop = naturalTop + targetY;
    const newBottom = newTop + elementH;

    let clampedX = targetX;
    let clampedY = targetY;

    // Constrain horizontally
    if (viewportW - 2 * MARGIN < elementW) {
      clampedX = MARGIN - naturalLeft;
    } else {
      if (newLeft < MARGIN) {
        clampedX = MARGIN - naturalLeft;
      } else if (newRight > viewportW - MARGIN) {
        clampedX = viewportW - MARGIN - naturalLeft - elementW;
      }
    }

    // Constrain vertically
    if (viewportH - 2 * MARGIN < elementH) {
      clampedY = MARGIN - naturalTop;
    } else {
      if (newTop < MARGIN) {
        clampedY = MARGIN - naturalTop;
      } else if (newBottom > viewportH - MARGIN) {
        clampedY = viewportH - MARGIN - naturalTop - elementH;
      }
    }

    return { x: clampedX, y: clampedY };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Left click or touch only

    isPointerDownRef.current = true;
    isDraggingRef.current = false;

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...position };

    // Capture element reference and pointerId locally to prevent React event pooling issues
    const targetElement = e.currentTarget;
    const pointerId = e.pointerId;

    // Calculate natural (untranslated) position of the container once at the start of the drag.
    // This prevents layout thrashing and avoids feedback loops from outdated state during dragging.
    const rect = targetElement.getBoundingClientRect();
    const naturalLeft = rect.left - position.x;
    const naturalTop = rect.top - position.y;
    const elementW = rect.width;
    const elementH = rect.height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isPointerDownRef.current) return;

      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      // Threshold check to differentiate between click and drag
      if (!isDraggingRef.current && Math.hypot(dx, dy) > 5) {
        isDraggingRef.current = true;
        setIsDragging(true);
        try {
          targetElement.setPointerCapture(pointerId);
        } catch (err) {
          console.warn('Pointer capture failed:', err);
        }
      }

      if (isDraggingRef.current) {
        const targetX = startPos.x + dx;
        const targetY = startPos.y + dy;

        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;

        const newLeft = naturalLeft + targetX;
        const newRight = newLeft + elementW;
        const newTop = naturalTop + targetY;
        const newBottom = newTop + elementH;

        let clampedX = targetX;
        let clampedY = targetY;

        // Constrain horizontally
        if (viewportW - 2 * MARGIN < elementW) {
          clampedX = MARGIN - naturalLeft;
        } else {
          if (newLeft < MARGIN) {
            clampedX = MARGIN - naturalLeft;
          } else if (newRight > viewportW - MARGIN) {
            clampedX = viewportW - MARGIN - naturalLeft - elementW;
          }
        }

        // Constrain vertically
        if (viewportH - 2 * MARGIN < elementH) {
          clampedY = MARGIN - naturalTop;
        } else {
          if (newTop < MARGIN) {
            clampedY = MARGIN - naturalTop;
          } else if (newBottom > viewportH - MARGIN) {
            clampedY = viewportH - MARGIN - naturalTop - elementH;
          }
        }

        setPosition({ x: clampedX, y: clampedY });
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      isPointerDownRef.current = false;
      
      try {
        targetElement.releasePointerCapture(pointerId);
      } catch (err) {}

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (isDraggingRef.current) {
        upEvent.preventDefault();
        upEvent.stopPropagation();
        
        // Let the click event capture first before clearing drag flags
        setTimeout(() => {
          isDraggingRef.current = false;
          setIsDragging(false);
        }, 50);
      } else {
        setIsDragging(false);
        // Single tap/click on minimized circle expands it
        if (isMinimized) {
          setIsMinimized(false);
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Persist position and minimized state
  useEffect(() => {
    localStorage.setItem('bottom-nav-position', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem('bottom-nav-minimized', String(isMinimized));
  }, [isMinimized]);

  // Readjust position when minimization state changes (to ensure expanded menu stays inside the viewport)
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setPosition(prev => constrainPosition(prev.x, prev.y, prev));
    });
    return () => cancelAnimationFrame(handle);
  }, [isMinimized]);

  // Adjust containment when window sizes change
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => constrainPosition(prev.x, prev.y, prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed bottom-3 right-0 left-0 z-50 flex justify-center pointer-events-none">
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onClickCapture={handleClickCapture}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
        className={cn(
          "flex items-center pointer-events-auto bg-transparent select-none touch-none",
          isDragging ? "transition-none" : "transition-transform duration-300 ease-out"
        )}
      >
        {isMinimized ? (
          <div
            title="Click to expand navigation"
            className={cn(
              "h-14 w-14 rounded-full border bg-card/95 shadow-lg backdrop-blur-sm flex items-center justify-center text-primary transition-all duration-300 hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing border-primary/20",
              isDragging ? "cursor-grabbing border-primary/50" : "cursor-grab"
            )}
          >
            <Menu className="h-6 w-6" />
          </div>
        ) : (
          <div 
            className={cn(
              "h-14 flex items-center rounded-2xl border bg-card/95 px-2 shadow-lg backdrop-blur-sm transition-all duration-300 w-[calc(100vw-48px)] max-w-[380px] justify-around border-border/60",
              isDragging ? "cursor-grabbing border-primary/30" : "cursor-grab active:cursor-grabbing"
            )}
          >
            {tabs.map(({ to, icon: Icon }) => {
              const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                  onMouseEnter={() => handleMouseEnter(to)}
                  className={`flex flex-1 items-center justify-center h-full transition-colors ${
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${active ? 'bg-primary/15 text-primary scale-110' : 'hover:bg-accent'}`}>
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                  </span>
                </NavLink>
              );
            })}

            {/* Collapse button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMinimized(true);
              }}
              className="flex flex-1 items-center justify-center h-full text-muted-foreground hover:text-foreground"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent">
                <Minimize2 className="h-5 w-5" strokeWidth={1.8} />
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
