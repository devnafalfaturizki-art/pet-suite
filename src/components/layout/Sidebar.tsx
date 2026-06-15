import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, PawPrint } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useModuleStore } from '@/stores/module.store';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { getNavigationRoutes } from '@/router/routes';

interface SidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ activePath, onNavigate, isMobileOpen = false, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const role = useAuthStore((state) => state.role);
  const modules = useModuleStore((state) => state.modules);
  const collapseSidebar = useUIStore((state) => state.toggleSidebar);

  const sections = useMemo(() => {
    const filteredRoutes = getNavigationRoutes(role, modules);

    return filteredRoutes.reduce<Record<string, typeof filteredRoutes[number][]>>((acc, item) => {
      acc[item.section] = acc[item.section] ?? [];
      acc[item.section].push(item);
      return acc;
    }, {});
  }, [modules, role]);

  const widthClasses = isCollapsed ? 'w-20' : 'w-72';

  return (
    <aside
      data-sidebar
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0',
        widthClasses,
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="space-y-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700">
            <PawPrint className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-base font-bold text-transparent dark:from-blue-400 dark:to-blue-500">
              PetCare Suite
            </span>
          )}
        </div>
        <div className="flex justify-end px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse ?? collapseSidebar}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(isCollapsed && 'mx-auto')}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex-1 space-y-6">
        {Object.entries(sections).map(([section, sectionItems]) => (
          <div key={section} className="space-y-2">
            {!isCollapsed && (
              <h2 className="px-2 text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section}
              </h2>
            )}
            <div className="space-y-1">
              {sectionItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 text-left font-normal',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-100 rounded-xl dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                      isCollapsed ? 'justify-center px-2' : 'px-3'
                    )}
                    onClick={() => {
                      onNavigate(item.path);
                      onClose?.();
                    }}
                    title={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}