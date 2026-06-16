import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, PawPrint, LogOut } from 'lucide-react';
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

const sectionLabels: Record<string, string> = {
  operations: 'Operations',
  commerce: 'Commerce',
  crm: 'CRM',
  management: 'Management',
};

const sidebarVariants = {
  expanded: { width: '18rem', transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const } },
  collapsed: { width: '5rem', transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const itemVariants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.15 } },
};

export function Sidebar({ activePath, onNavigate, isMobileOpen = false, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const modules = useModuleStore((state) => state.modules);
  const collapseSidebar = useUIStore((state) => state.toggleSidebar);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const sections = useMemo(() => {
    const filteredRoutes = getNavigationRoutes(role, modules);
    return filteredRoutes.reduce<Record<string, typeof filteredRoutes[number][]>>((acc, item) => {
      acc[item.section] = acc[item.section] ?? [];
      acc[item.section].push(item);
      return acc;
    }, {});
  }, [modules, role]);

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"
          onClick={onClose}
        />
      )}
      <motion.aside
        data-sidebar
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        initial={false}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col overflow-y-auto border-r border-slate-200/80 bg-white shadow-lg dark:border-slate-800/80 dark:bg-slate-950 lg:static lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800">
          <motion.div
            className="flex items-center gap-3"
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm">
              <PawPrint className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-base font-bold text-transparent dark:from-blue-400 dark:to-blue-500">
                PetCare
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Suite
              </span>
            </div>
          </motion.div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse ?? collapseSidebar}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden h-7 w-7 rounded-lg p-0 lg:flex"
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {Object.entries(sections).map(([section, sectionItems]) => (
            <div key={section} className="space-y-1.5">
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.h2
                    key={`label-${section}`}
                    variants={itemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500"
                  >
                    {sectionLabels[section] ?? section}
                  </motion.h2>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {sectionItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = activePath === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      variants={itemVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          'group relative w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
                          isCollapsed && 'justify-center px-0'
                        )}
                        onClick={() => {
                          onNavigate(item.path);
                          onClose?.();
                        }}
                        title={item.label}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <motion.span
                            layoutId="activeIndicator"
                            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-600 dark:bg-blue-400"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        <Icon className={cn(
                          'h-4.5 w-4.5 shrink-0 transition-transform duration-200',
                          isActive && 'scale-110',
                          'group-hover:scale-110'
                        )} />
                        <AnimatePresence mode="wait">
                          {!isCollapsed && (
                            <motion.span
                              key={`label-${item.path}`}
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User area */}
        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="user-expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user?.fullName ?? 'User'}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {role ?? 'guest'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearAuth()}
                  className="h-7 w-7 rounded-lg p-0 text-slate-400 hover:text-red-500"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="user-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}